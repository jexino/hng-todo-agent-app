import { z } from 'zod';

const idSchema = z.string().uuid();

export function createResourceController({ resource, store, createSchema, updateSchema }) {
  return {
    async list(_request, response, next) {
      try {
        response.json({ data: await store.list(resource) });
      } catch (error) {
        next(error);
      }
    },
    async create(request, response, next) {
      try {
        const values = createSchema.parse(request.body);
        const record = await store.create(resource, values);
        response.status(201).json({ data: record });
      } catch (error) {
        next(error);
      }
    },
    async update(request, response, next) {
      try {
        const id = idSchema.parse(request.params.id);
        const values = updateSchema.parse(request.body);
        if (Object.keys(values).length === 0) {
          return response.status(400).json({ error: { message: 'Provide at least one field to update.' } });
        }
        const record = await store.update(resource, id, values);
        if (!record) return response.status(404).json({ error: { message: `${resource.slice(0, -1)} not found.` } });
        response.json({ data: record });
      } catch (error) {
        next(error);
      }
    },
    async remove(request, response, next) {
      try {
        const id = idSchema.parse(request.params.id);
        const removed = await store.remove(resource, id);
        if (!removed) return response.status(404).json({ error: { message: `${resource.slice(0, -1)} not found.` } });
        response.status(204).end();
      } catch (error) {
        next(error);
      }
    }
  };
}
