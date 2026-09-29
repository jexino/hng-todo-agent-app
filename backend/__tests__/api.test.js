import request from 'supertest';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/lib/store.js';

function createTestApp() {
  return createApp({ store: createMemoryStore() });
}

describe('task endpoints', () => {
  test('creates, reads, updates, and deletes a task', async () => {
    const app = createTestApp();
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Prepare project brief', description: 'Draft the outline', category: 'Work' })
      .expect(201);
    const taskId = created.body.data.id;

    expect(created.body.data).toMatchObject({ title: 'Prepare project brief', completed: false, category: 'Work' });
    expect((await request(app).get('/api/tasks').expect(200)).body.data).toHaveLength(1);
    expect((await request(app).patch(`/api/tasks/${taskId}`).send({ completed: true }).expect(200)).body.data.completed).toBe(true);
    await request(app).delete(`/api/tasks/${taskId}`).expect(204);
    expect((await request(app).get('/api/tasks').expect(200)).body.data).toHaveLength(0);
  });

  test('rejects empty titles and unknown fields', async () => {
    const app = createTestApp();
    const emptyTitle = await request(app).post('/api/tasks').send({ title: '  ' }).expect(400);
    const unknownField = await request(app).post('/api/tasks').send({ title: 'Valid title', admin: true }).expect(400);

    expect(emptyTitle.body.error.message).toBe('Request validation failed.');
    expect(unknownField.body.error.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'admin' })
    ]));
  });

  test('rejects malformed IDs and returns 404 for missing tasks', async () => {
    const app = createTestApp();
    await request(app).patch('/api/tasks/not-a-uuid').send({ completed: true }).expect(400);
    await request(app).delete('/api/tasks/0a4b12e2-c641-4a4b-88e5-fd8f17a06555').expect(404);
  });
});

describe('notes and smart-assist endpoints', () => {
  test('creates a note and rejects an unsupported note color', async () => {
    const app = createTestApp();
    const created = await request(app).post('/api/notes').send({ title: 'Meeting', body: 'Decisions and next steps.' }).expect(201);
    expect(created.body.data.color).toBe('paper');
    await request(app).post('/api/notes').send({ title: 'Bad color', color: 'violet' }).expect(400);
  });

  test('returns a prompt-template category and summary', async () => {
    const app = createTestApp();
    const category = await request(app).post('/api/smart-assist').send({ mode: 'categorize', text: 'Prepare the client report before the deadline' }).expect(200);
    const summary = await request(app).post('/api/smart-assist').send({ mode: 'summarize', text: 'First sentence. Second sentence. Third sentence.' }).expect(200);

    expect(category.body).toMatchObject({ data: { category: 'Work' }, provider: 'prompt-template-simulation' });
    expect(summary.body.data.summary).toBe('First sentence. Second sentence.');
    await request(app).post('/api/smart-assist').send({ mode: 'categorize', text: '' }).expect(400);
  });
});
