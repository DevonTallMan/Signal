#!/usr/bin/env node
/**
 * check-assessment-ids.mjs
 *
 * Detects renamed or removed assessment question IDs on topics that are
 * published on the base branch (origin/main by default).
 *
 * Why this check exists:
 * Student progress records in Firestore reference assessments by their `id`
 * field. If an author renames a question ID on a published topic, every
 * Firestore progress record pointing at the old ID is orphaned. Data loss
 * is silent. This check catches it at PR time.
 *
 * What it does:
 *   For every topic file that is *published* on origin/main, require that
 *   every assessment ID from the main version still exists in the PR
 *   version. New IDs can be added freely. Non-published topics are not
 *   checked.
 *
 * What it doesn't do:
 *   Doesn't check Firestore. Assumes any published ID could have student
 *   records attached. This is deliberately conservative.
 *
 * Usage:
 *   node scripts/check-assessment-ids.mjs
 *
 * Environment:
 *   BASE_REF  Git ref to compare against. Defaults to origin/main.
 *
 * Exit codes:
 *   0  All good, or no applicable comparisons to make.
 *   1  One or more IDs were removed or renamed.
 *   2  Script error (bad input, missing git history, etc).
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

const TOPICS_DIR = 'src/content/topics';
const BASE_REF = process.env.BASE_REF ?? 'origin/main';

/** Parse a .mdoc file's frontmatter. Returns {status, ids}. */
function parseTopic(content, pathForErrors) {
  try {
    const { data } = matter(content);
    const assessments = Array.isArray(data.assessments) ? data.assessments : [];
    const ids = assessments
      .map((a) => a?.value?.id)
      .filter((id) => typeof id === 'string' && id.length > 0);
    return {
      status: data.status ?? 'draft',
      ids,
    };
  } catch (e) {
    throw new Error(`Failed to parse frontmatter in ${pathForErrors}: ${e.message}`);
  }
}

/** Read a file at a specific git ref, or null if it doesn't exist there. */
function readFromRef(ref, path) {
  try {
    return execSync(`git show ${ref}:${path}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

/** List topic files that exist on a given ref. */
function listTopicsAtRef(ref) {
  try {
    const output = execSync(
      `git ls-tree -r --name-only ${ref} -- ${TOPICS_DIR}`,
      { encoding: 'utf8' }
    );
    return output
      .trim()
      .split('\n')
      .filter((f) => f.endsWith('.mdoc') || f.endsWith('.md'));
  } catch {
    return [];
  }
}

/**
 * Check whether a file path exists on disk in the PR state.
 * We use the working tree (existsSync) rather than git ls-files because
 * ls-files includes files that are tracked-but-deleted, which would mask
 * the very case this check needs to flag.
 */
function fileExistsInPR(path) {
  return existsSync(path);
}

// ---------------------------------------------------------------------------

function main() {
  // Sanity check: can we actually see the base ref?
  try {
    execSync(`git rev-parse ${BASE_REF}`, { stdio: 'ignore' });
  } catch {
    console.error(`❌ Cannot resolve BASE_REF "${BASE_REF}".`);
    console.error(
      `   In CI, ensure actions/checkout uses fetch-depth: 0 and that a \`git fetch origin main\` step runs before this check.`
    );
    process.exit(2);
  }

  const errors = [];
  const warnings = [];
  let topicsChecked = 0;
  let publishedTopicsChecked = 0;

  const baseTopics = listTopicsAtRef(BASE_REF);

  for (const filePath of baseTopics) {
    topicsChecked++;

    const baseContent = readFromRef(BASE_REF, filePath);
    if (!baseContent) continue;

    let baseTopic;
    try {
      baseTopic = parseTopic(baseContent, `${BASE_REF}:${filePath}`);
    } catch (e) {
      warnings.push(e.message);
      continue;
    }

    // Only enforce on topics that are published on the base branch.
    if (baseTopic.status !== 'published') continue;
    if (baseTopic.ids.length === 0) continue;
    publishedTopicsChecked++;

    // File missing from PR working tree — deletion case, even if still
    // tracked in the index.
    if (!fileExistsInPR(filePath)) {
      errors.push({
        file: filePath,
        kind: 'deleted',
        detail: `Published topic missing from working tree. Would orphan ${baseTopic.ids.length} assessment ID(s): ${baseTopic.ids.join(', ')}.`,
      });
      continue;
    }

    let prTopic;
    try {
      prTopic = parseTopic(readFileSync(filePath, 'utf8'), filePath);
    } catch (e) {
      errors.push({ file: filePath, kind: 'parse', detail: e.message });
      continue;
    }

    const prIds = new Set(prTopic.ids);
    const missingIds = baseTopic.ids.filter((id) => !prIds.has(id));
    if (missingIds.length > 0) {
      errors.push({
        file: filePath,
        kind: 'renamed_or_removed',
        detail: `Published assessment ID(s) no longer present: ${missingIds.join(', ')}.`,
      });
    }
  }

  // Report warnings first, non-fatal.
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const w of warnings) console.log(`   ${w}`);
    console.log('');
  }

  if (errors.length === 0) {
    console.log('✅ Assessment ID integrity check passed.');
    console.log(
      `   Checked ${topicsChecked} topic file(s) on ${BASE_REF} (${publishedTopicsChecked} published with assessment IDs).`
    );
    process.exit(0);
  }

  console.error('❌ Assessment ID integrity check FAILED.');
  console.error('');
  for (const e of errors) {
    console.error(`   ${e.file}`);
    console.error(`     ${e.detail}`);
    console.error('');
  }

  console.error('Why this matters:');
  console.error(
    '  Student progress records in Firestore reference assessment questions by ID.'
  );
  console.error(
    '  Changing or removing an ID on a published topic orphans those records.'
  );
  console.error('');
  console.error('How to resolve:');
  console.error(
    '  - To fix a bad question, edit the prompt/options/feedback without changing the ID.'
  );
  console.error(
    '  - To retire a question, keep the ID in the file but mark it deprecated in a separate migration PR that also cleans Firestore.'
  );
  console.error(
    '  - To remove a topic, set status to "archived" rather than deleting the file.'
  );
  console.error(
    '  - If the topic was never meant to be published, revert the status change on main first in a separate PR.'
  );

  process.exit(1);
}

main();
