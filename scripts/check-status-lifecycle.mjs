#!/usr/bin/env node
/**
 * check-status-lifecycle.mjs
 *
 * Enforces the editorial review gate for published topics.
 *
 * Rules (fail on violation):
 *   R1. A published topic must have at least one entry in `reviewers`.
 *   R2. A published topic must have `last_reviewed` set.
 *   R3. If a topic is published on both main and PR, and its content
 *       (explanation body or assessments) has changed, `last_reviewed`
 *       must also have changed. This forces authors to acknowledge
 *       re-review of any published content they touch.
 *
 * Warnings (non-fatal):
 *   W1. Self-review: every reviewer is also an author. Allowed in solo
 *       mode but worth surfacing once a second contributor exists.
 *
 * What this check explicitly does NOT do:
 *   - It does not verify that a reviewer has actually reviewed the PR
 *     on GitHub. That requires GitHub API access and an author-to-
 *     GitHub-username mapping we don't yet have.
 *   - It cannot prevent an author from setting reviewers and
 *     last_reviewed dishonestly. The check creates structural evidence,
 *     not trust. That's a social problem, not a mechanical one.
 *
 * Usage:
 *   node scripts/check-status-lifecycle.mjs
 *
 * Environment:
 *   BASE_REF  Git ref to compare against. Defaults to origin/main.
 *
 * Exit codes:
 *   0  Pass (possibly with warnings).
 *   1  One or more rules violated.
 *   2  Script error.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const TOPICS_DIR = 'src/content/topics';
const BASE_REF = process.env.BASE_REF ?? 'origin/main';

function parseTopic(content) {
  const parsed = matter(content);
  return { data: parsed.data ?? {}, body: parsed.content ?? '' };
}

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

function listTopicsInPR() {
  // Walk the filesystem directly. This catches both staged and unstaged
  // topic files, which matters for local runs and for the first commit
  // of a file in a PR.
  if (!existsSync(TOPICS_DIR)) return [];
  const results = [];
  for (const entry of readdirSync(TOPICS_DIR)) {
    if (entry.startsWith('_')) continue; // _images, _partials, etc.
    const full = join(TOPICS_DIR, entry);
    try {
      const st = statSync(full);
      if (st.isFile() && (entry.endsWith('.mdoc') || entry.endsWith('.md'))) {
        results.push(full);
      }
    } catch {
      // skip
    }
  }
  return results;
}

/**
 * Canonical signature of the reviewable content. Changes to this signature
 * require a last_reviewed bump. Changes to metadata outside this signature
 * (revision_notes, prerequisites, estimated_minutes, etc.) do not.
 */
function contentSignature(data, body) {
  const assessments = JSON.stringify(data.assessments ?? []);
  const learningOutcomes = JSON.stringify(data.learning_outcomes ?? []);
  return `${body.trim()}::${assessments}::${learningOutcomes}`;
}

function dateString(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

// ---------------------------------------------------------------------------

function main() {
  try {
    execSync(`git rev-parse ${BASE_REF}`, { stdio: 'ignore' });
  } catch {
    console.error(`❌ Cannot resolve BASE_REF "${BASE_REF}".`);
    process.exit(2);
  }

  const errors = [];
  const warnings = [];
  let publishedCount = 0;

  for (const filePath of listTopicsInPR()) {
    let prContent;
    try {
      prContent = readFileSync(filePath, 'utf8');
    } catch (e) {
      warnings.push(`Cannot read ${filePath}: ${e.message}`);
      continue;
    }

    let pr;
    try {
      pr = parseTopic(prContent);
    } catch (e) {
      errors.push({
        file: filePath,
        detail: `Failed to parse frontmatter: ${e.message}`,
      });
      continue;
    }

    // Rules only apply to published topics.
    if (pr.data.status !== 'published') continue;
    publishedCount++;

    const reviewers = Array.isArray(pr.data.reviewers) ? pr.data.reviewers : [];
    const authors = Array.isArray(pr.data.authors) ? pr.data.authors : [];
    const lastReviewed = dateString(pr.data.last_reviewed);

    // R1: reviewers must be non-empty
    if (reviewers.length === 0) {
      errors.push({
        file: filePath,
        rule: 'R1',
        detail: `status is "published" but reviewers array is empty. Add at least one reviewer.`,
      });
    }

    // R2: last_reviewed must be set
    if (!lastReviewed) {
      errors.push({
        file: filePath,
        rule: 'R2',
        detail: `status is "published" but last_reviewed is not set. Set the date editorial review was completed.`,
      });
    }

    // W1: self-review warning
    if (
      reviewers.length > 0 &&
      authors.length > 0 &&
      reviewers.every((r) => authors.includes(r))
    ) {
      warnings.push(
        `${filePath}: every reviewer is also an author. Self-review is acceptable in solo mode but should be avoided once a second contributor exists.`
      );
    }

    // R3: content change on published topic requires last_reviewed bump
    const baseContent = readFromRef(BASE_REF, filePath);
    if (baseContent) {
      let base;
      try {
        base = parseTopic(baseContent);
      } catch {
        continue;
      }

      if (base.data.status === 'published') {
        const baseSig = contentSignature(base.data, base.body);
        const prSig = contentSignature(pr.data, pr.body);

        if (baseSig !== prSig) {
          const baseDate = dateString(base.data.last_reviewed);
          const prDate = lastReviewed;

          if (baseDate && prDate && baseDate === prDate) {
            errors.push({
              file: filePath,
              rule: 'R3',
              detail: `Content (explanation, assessments, or learning outcomes) has changed but last_reviewed is unchanged (${prDate}). Update last_reviewed to acknowledge re-review of the change.`,
            });
          }
        }
      }
    }
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const w of warnings) console.log(`   ${w}`);
    console.log('');
  }

  if (errors.length === 0) {
    console.log('✅ Status lifecycle check passed.');
    console.log(`   ${publishedCount} published topic(s) validated.`);
    process.exit(0);
  }

  console.error('❌ Status lifecycle check FAILED.');
  console.error('');
  for (const e of errors) {
    console.error(`   ${e.file}  [${e.rule}]`);
    console.error(`     ${e.detail}`);
    console.error('');
  }
  console.error('Why this matters:');
  console.error(
    '  A topic with status=published ships to students. Before that happens, an editor'
  );
  console.error(
    '  must have reviewed it. This check enforces the structural evidence of that review'
  );
  console.error(
    '  (reviewers array, last_reviewed date), not the review itself.'
  );
  console.error('');
  console.error('How to resolve:');
  console.error(
    '  - Use status "review" instead of "published" if editorial review has not happened.'
  );
  console.error(
    '  - Add at least one author ID to `reviewers` once review is complete.'
  );
  console.error('  - Set `last_reviewed` to the date review was signed off.');
  console.error(
    '  - When modifying a published topic, bump `last_reviewed` to acknowledge re-review.'
  );
  process.exit(1);
}

main();
