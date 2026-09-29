import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const RESOURCE_TABLES = {
  tasks: 'tasks',
  notes: 'notes'
};

export function createMemoryStore() {
  const records = new Map(Object.keys(RESOURCE_TABLES).map((resource) => [resource, new Map()]));

  return {
    async list(resource) {
      return [...records.get(resource).values()].sort((left, right) => right.created_at.localeCompare(left.created_at));
    },
    async get(resource, id) {
      return records.get(resource).get(id) ?? null;
    },
    async create(resource, data) {
      const now = new Date().toISOString();
      const record = { id: randomUUID(), ...data, created_at: now, updated_at: now };
      records.get(resource).set(record.id, record);
      return record;
    },
    async update(resource, id, data) {
      const current = records.get(resource).get(id);
      if (!current) return null;
      const record = { ...current, ...data, updated_at: new Date().toISOString() };
      records.get(resource).set(id, record);
      return record;
    },
    async remove(resource, id) {
      return records.get(resource).delete(id);
    }
  };
}

export function createSupabaseStore(client) {
  return {
    async list(resource) {
      const { data, error } = await client.from(RESOURCE_TABLES[resource]).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async get(resource, id) {
      const { data, error } = await client.from(RESOURCE_TABLES[resource]).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async create(resource, values) {
      const { data, error } = await client.from(RESOURCE_TABLES[resource]).insert(values).select().single();
      if (error) throw error;
      return data;
    },
    async update(resource, id, values) {
      const { data, error } = await client.from(RESOURCE_TABLES[resource]).update(values).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    async remove(resource, id) {
      const { error, count } = await client.from(RESOURCE_TABLES[resource]).delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      return count === null || count > 0;
    }
  };
}

export function createStore(env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return createMemoryStore();
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return createSupabaseStore(client);
}
