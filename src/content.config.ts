import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Author profiles
const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.{md,mdoc}' }),
  schema: z.object({
    display_name: z.string(),
    role: z.enum(['lead', 'teacher', 'sme', 'editor']),
    institution: z.string().optional(),
    credentials: z.string().optional(),
    avatar: z.string().optional(),
    joined_date: z.coerce.date().optional(),
    active: z.boolean().default(true),
  }),
});

// IfATE content areas
const contentAreas = defineCollection({
  loader: glob({
    base: './src/content/content-areas',
    pattern: '**/*.{md,mdoc}',
  }),
  schema: z.object({
    display_code: z.string(),
    title: z.string(),
    paper: z.enum(['1', '2']),
    order: z.number().default(0),
  }),
});

// Assessment schemas. These mirror the Keystatic blocks field. We keep them
// permissive here because rendering them is deferred to a later sprint; the
// goal of the Astro schema is to validate that frontmatter parses, not to
// lock down the full shape.
const mcqSchema = z.object({
  discriminant: z.literal('mcq'),
  value: z.object({
    id: z.string(),
    prompt: z.string(),
    options: z.array(z.string()),
    correct_index: z.number(),
    feedback_correct: z.string().optional(),
    feedback_incorrect: z.string().optional(),
    difficulty: z.enum(['foundation', 'standard', 'stretch']),
  }),
});

const neiSchema = z.object({
  discriminant: z.literal('nei'),
  value: z.object({
    id: z.string(),
    stimulus: z.string().optional(),
    question: z.string(),
    max_marks: z.number(),
    mark_scheme: z.object({
      name_expected: z.string().optional(),
      explain_expected: z.string().optional(),
      impact_expected: z.string().optional(),
    }),
    exemplar_answer: z.string().optional(),
  }),
});

const topics = defineCollection({
  loader: glob({ base: './src/content/topics', pattern: '**/*.{md,mdoc}' }),
  schema: z.object({
    title: z.string(),
    section_id: z.string(),
    content_area: z.string(), // slug reference
    paper: z.enum(['1', '2']),
    status: z.enum(['draft', 'review', 'published', 'archived']),
    spec_version: z.string().optional(),
    authors: z.array(z.string()).min(1),
    reviewers: z.array(z.string()).default([]),
    learning_outcomes: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
    estimated_minutes: z.number().default(25),
    last_reviewed: z.coerce.date().optional(),
    revision_notes: z.string().optional(),
    assessments: z.array(z.union([mcqSchema, neiSchema])).default([]),
  }),
});

export const collections = { topics, authors, contentAreas };
