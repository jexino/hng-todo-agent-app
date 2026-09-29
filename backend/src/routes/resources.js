import { Router } from 'express';
import { z } from 'zod';
import { createResourceController } from '../controllers/resourceController.js';

const taskFields = {
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).default(''),
  category: z.string().trim().max(40).default('Other'),
  completed: z.boolean().default(false),
  due_date: z.string().date().nullable().default(null)
};

const noteFields = {
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().max(12000).default(''),
  color: z.enum(['paper', 'mint', 'rose', 'sky']).default('paper')
};

const taskCreateSchema = z.object(taskFields).strict();
const taskUpdateSchema = z.object({
  title: taskFields.title.optional(),
  description: taskFields.description.optional(),
  category: taskFields.category.optional(),
  completed: taskFields.completed.optional(),
  due_date: taskFields.due_date.optional()
}).strict();
const noteCreateSchema = z.object(noteFields).strict();
const noteUpdateSchema = z.object({
  title: noteFields.title.optional(),
  body: noteFields.body.optional(),
  color: noteFields.color.optional()
}).strict();

export function createResourceRouter({ resource, store }) {
  const schemas = resource === 'tasks'
    ? { createSchema: taskCreateSchema, updateSchema: taskUpdateSchema }
    : { createSchema: noteCreateSchema, updateSchema: noteUpdateSchema };
  const controller = createResourceController({ resource, store, ...schemas });
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
