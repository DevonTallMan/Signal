/**
 * Signal CMS — Keystatic Configuration
 *
 * Three collections: topics, authors, content-areas.
 * Content lives in git; student state lives in Firestore (not managed here).
 *
 * Do not edit assessment question IDs after a topic is published. They are the
 * stable key that Firestore progress records reference. CI should reject any
 * PR that renames an existing question ID.
 */

import { config, fields, collection } from '@keystatic/core';

// ---------------------------------------------------------------------------
// AUTHORS
// One file per contributor. Attribution and profile data.
// ---------------------------------------------------------------------------
const authors = collection({
  label: 'Authors',
  slugField: 'id',
  path: 'src/content/authors/*',
  columns: ['display_name', 'role', 'institution'],
  format: { contentField: 'bio' },
  schema: {
    id: fields.slug({
      name: {
        label: 'Author ID',
        description:
          'Lowercase, hyphenated. Example: chris-morris. Permanent after first use.',
      },
    }),
    display_name: fields.text({
      label: 'Display Name',
      description: 'Shown on topic bylines and author profile page.',
      validation: { length: { min: 1 } },
    }),
    role: fields.select({
      label: 'Role',
      options: [
        { label: 'Lead Author', value: 'lead' },
        { label: 'Contributing Teacher', value: 'teacher' },
        { label: 'Subject Matter Expert', value: 'sme' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'teacher',
    }),
    institution: fields.text({
      label: 'Institution',
      description: 'Current or most recent FE or HE institution. Optional.',
    }),
    credentials: fields.text({
      label: 'Credentials',
      multiline: true,
      description: 'One or two sentences. Shown next to byline.',
    }),
    avatar: fields.image({
      label: 'Avatar',
      directory: 'src/content/authors/_images',
      publicPath: '/authors/_images/',
      validation: { isRequired: false },
    }),
    joined_date: fields.date({
      label: 'Joined Date',
    }),
    active: fields.checkbox({
      label: 'Active contributor',
      defaultValue: true,
      description:
        'Unchecking hides from author directory but keeps existing bylines intact.',
    }),
    bio: fields.markdoc({
      label: 'Bio',
      description: 'Longer biography. Rendered on the author profile page.',
    }),
  },
});

// ---------------------------------------------------------------------------
// CONTENT AREAS
// The IfATE topic areas (not Pearson IP). Reference data, rarely edited.
// ---------------------------------------------------------------------------
const contentAreas = collection({
  label: 'Content Areas',
  slugField: 'code',
  path: 'src/content/content-areas/*',
  columns: ['title', 'paper', 'order'],
  format: { contentField: 'description' },
  schema: {
    code: fields.slug({
      name: {
        label: 'Code',
        description: 'Hyphenated, used in URLs. Example: 6-1. No dots.',
      },
    }),
    display_code: fields.text({
      label: 'Display Code',
      description: 'Shown in UI. Example: 6.1',
      validation: { length: { min: 1 } },
    }),
    title: fields.text({
      label: 'Title',
      validation: { length: { min: 1 } },
    }),
    paper: fields.select({
      label: 'Paper',
      options: [
        { label: 'Paper 1', value: '1' },
        { label: 'Paper 2', value: '2' },
        { label: 'Method', value: 'method' },
      ],
      defaultValue: '1',
    }),
    order: fields.integer({
      label: 'Display Order',
      description: 'Lower numbers appear first within a paper.',
      validation: { min: 0 },
      defaultValue: 0,
    }),
    description: fields.markdoc({
      label: 'Description',
      description: 'Overview shown on the content area index page.',
    }),
  },
});

// ---------------------------------------------------------------------------
// TOPICS
// The core unit. One file per teaching topic. Contains explanation
// and assessments in a single authoring surface.
// ---------------------------------------------------------------------------
const topics = collection({
  label: 'Topics',
  slugField: 'slug',
  path: 'src/content/topics/*',
  columns: ['title', 'section_id', 'status', 'paper'],
  format: { contentField: 'explanation' },
  schema: {
    slug: fields.slug({
      name: {
        label: 'Slug',
        description:
          'URL segment. Example: 6-1-1-data-types. Treat as permanent once published.',
      },
    }),
    title: fields.text({
      label: 'Title',
      description: 'Student-facing topic name.',
      validation: { length: { min: 1 } },
    }),
    section_id: fields.text({
      label: 'Section ID',
      description: 'IfATE section reference. Example: 6.1.1',
      validation: { length: { min: 1 } },
    }),
    content_area: fields.relationship({
      label: 'Content Area',
      collection: 'contentAreas',
      validation: { isRequired: true },
    }),
    paper: fields.select({
      label: 'Paper',
      options: [
        { label: 'Paper 1', value: '1' },
        { label: 'Paper 2', value: '2' },
        { label: 'Method', value: 'method' },
      ],
      defaultValue: '1',
    }),
    status: fields.select({
      label: 'Status',
      options: [
        { label: 'Draft (not visible to students)', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      description:
        'Only "published" is rendered on the live site. Build filters the rest.',
    }),
    spec_version: fields.text({
      label: 'Specification Version',
      description:
        'Which IfATE spec version this was authored against. Example: 2024-01.',
      defaultValue: '2024-01',
    }),
    authors: fields.array(
      fields.relationship({
        label: 'Author',
        collection: 'authors',
        validation: { isRequired: true },
      }),
      {
        label: 'Authors',
        description: 'Primary author first. Shown on byline.',
        itemLabel: (props) => props.value ?? 'Select an author',
        validation: { length: { min: 1 } },
      }
    ),
    reviewers: fields.array(
      fields.relationship({
        label: 'Reviewer',
        collection: 'authors',
      }),
      {
        label: 'Reviewers',
        description: 'People who editorially reviewed this topic before publish.',
        itemLabel: (props) => props.value ?? 'Select a reviewer',
      }
    ),
    learning_outcomes: fields.array(
      fields.text({ label: 'Outcome' }),
      {
        label: 'Learning Outcomes',
        description: 'What the student can do after completing this topic.',
        itemLabel: (props) => props.value,
      }
    ),
    prerequisites: fields.array(
      fields.relationship({
        label: 'Prerequisite Topic',
        collection: 'topics',
      }),
      {
        label: 'Prerequisites',
        description: 'Topics a student should complete first.',
        itemLabel: (props) => props.value ?? 'Select a topic',
      }
    ),
    estimated_minutes: fields.integer({
      label: 'Estimated Minutes',
      defaultValue: 25,
      validation: { min: 1, max: 180 },
    }),
    last_reviewed: fields.date({
      label: 'Last Reviewed',
      description: 'Date of most recent editorial sign-off.',
    }),
    revision_notes: fields.text({
      label: 'Revision Notes',
      multiline: true,
      description: 'Changelog. Not rendered to students.',
    }),
    library_summary: fields.text({
      label: 'Library Summary',
      multiline: true,
      description:
        'One or two sentences shown on the methodology library card for this topic. Optional. Leave blank for topics that should not appear in the library.',
    }),
    explanation: fields.markdoc({
      label: 'Explanation',
      description: 'The main teaching content.',
      options: {
        image: {
          directory: 'src/content/topics/_images',
          publicPath: '/topics/_images/',
        },
      },
    }),
    assessments: fields.blocks(
        {
          mcq: {
            label: 'Multiple Choice',
            itemLabel: (props) => {
              const p = props.fields.prompt.value ?? '';
              return p ? `MCQ: ${p.slice(0, 60)}${p.length > 60 ? '…' : ''}` : 'MCQ';
            },
            schema: fields.object({
              id: fields.text({
                label: 'Question ID',
                description:
                  'Stable ID. Example: 611-mcq-01. Never change after publish.',
                validation: { length: { min: 1 } },
              }),
              prompt: fields.text({
                label: 'Prompt',
                multiline: true,
                validation: { length: { min: 1 } },
              }),
              options: fields.array(fields.text({ label: 'Option' }), {
                label: 'Options',
                description: 'Between 2 and 6 options.',
                itemLabel: (props) => props.value,
              }),
              correct_index: fields.integer({
                label: 'Correct Answer Index',
                description: 'Zero-based. 0 is the first option.',
                validation: { min: 0 },
                defaultValue: 0,
              }),
              feedback_correct: fields.text({
                label: 'Feedback When Correct',
                multiline: true,
              }),
              feedback_incorrect: fields.text({
                label: 'Feedback When Incorrect',
                multiline: true,
                description:
                  'Explain why the right answer is right, or give a targeted hint.',
              }),
              difficulty: fields.select({
                label: 'Difficulty',
                options: [
                  { label: 'Foundation', value: 'foundation' },
                  { label: 'Standard', value: 'standard' },
                  { label: 'Stretch', value: 'stretch' },
                ],
                defaultValue: 'standard',
              }),
            }),
          },
          nei: {
            label: 'Extended Answer (N-E-I)',
            itemLabel: (props) => {
              const q = props.fields.question.value ?? '';
              return q ? `NEI: ${q.slice(0, 60)}${q.length > 60 ? '…' : ''}` : 'NEI';
            },
            schema: fields.object({
              id: fields.text({
                label: 'Question ID',
                description:
                  'Stable ID. Example: 611-nei-01. Never change after publish.',
                validation: { length: { min: 1 } },
              }),
              stimulus: fields.text({
                label: 'Scenario',
                multiline: true,
                description:
                  'Context. Optional for purely theoretical questions.',
              }),
              question: fields.text({
                label: 'Question',
                multiline: true,
                validation: { length: { min: 1 } },
              }),
              max_marks: fields.integer({
                label: 'Max Marks',
                defaultValue: 4,
                validation: { min: 1, max: 12 },
              }),
              mark_scheme: fields.object(
                {
                  name_expected: fields.text({
                    label: 'Name (Point) Expected',
                    multiline: true,
                  }),
                  explain_expected: fields.text({
                    label: 'Explain Expected',
                    multiline: true,
                  }),
                  impact_expected: fields.text({
                    label: 'Impact Expected',
                    multiline: true,
                    description:
                      'The component students most often miss.',
                  }),
                },
                {
                  label: 'Mark Scheme',
                  description: 'Used by AXIOM-7 as the marking guide.',
                }
              ),
              exemplar_answer: fields.text({
                label: 'Exemplar Answer',
                multiline: true,
                description: 'Optional model answer shown after submission.',
              }),
            }),
          },
        },
        {
          label: 'Assessments',
          description: 'Order shown here is the order rendered.',
        }
      ),
  },
});

// ---------------------------------------------------------------------------
// CONFIG
// Storage switches via env var. Default to GitHub for production safety.
// ---------------------------------------------------------------------------
const STORAGE_KIND = process.env.KEYSTATIC_STORAGE_KIND;
const GITHUB_REPO = process.env.KEYSTATIC_GITHUB_REPO ?? 'DevonTallMan/Signal';

export default config({
  storage:
    STORAGE_KIND === 'local'
      ? { kind: 'local' }
      : {
          kind: 'github',
          repo: GITHUB_REPO as `${string}/${string}`,
        },
  ui: {
    brand: { name: 'Signal CMS' },
  },
  collections: {
    topics,
    authors,
    contentAreas,
  },
});
