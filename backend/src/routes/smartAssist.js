import { Router } from 'express';
import { z } from 'zod';

const requestSchema = z.object({
  text: z.string().trim().min(1).max(12000),
  mode: z.enum(['categorize', 'summarize'])
}).strict();

const categories = [
  { name: 'Work', terms: ['meeting', 'project', 'client', 'report', 'deadline', 'work', 'email'] },
  { name: 'Personal', terms: ['family', 'friend', 'home', 'personal', 'birthday', 'call'] },
  { name: 'Learning', terms: ['learn', 'course', 'study', 'read', 'practice', 'research'] },
  { name: 'Health', terms: ['doctor', 'exercise', 'health', 'walk', 'workout', 'medicine'] }
];

function categorize(text) {
  const normalized = text.toLowerCase();
  return categories
    .map(({ name, terms }) => ({ name, score: terms.reduce((total, term) => total + Number(normalized.includes(term)), 0) }))
    .sort((left, right) => right.score - left.score)[0].score > 0
    ? categories.map(({ name, terms }) => ({ name, score: terms.reduce((total, term) => total + Number(normalized.includes(term)), 0) })).sort((left, right) => right.score - left.score)[0].name
    : 'Other';
}

function summarize(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const summary = sentences.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
  return summary.length > 420 ? `${summary.slice(0, 417).trimEnd()}...` : summary;
}

export function createSmartAssistRouter() {
  const router = Router();
  router.post('/', (request, response, next) => {
    try {
      const { text, mode } = requestSchema.parse(request.body);
      const result = mode === 'categorize' ? { category: categorize(text) } : { summary: summarize(text) };
      response.json({ data: result, mode, provider: 'prompt-template-simulation' });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
