const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch {
    throw new Error('Cannot reach the API. Check that the backend is running.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error?.message || 'The request could not be completed.');
  }
  if (response.status === 204) return null;
  return response.json();
}

function resourceApi(resource) {
  return {
    list: async () => (await request(`/${resource}`)).data,
    create: async (values) => (await request(`/${resource}`, { method: 'POST', body: JSON.stringify(values) })).data,
    update: async (id, values) => (await request(`/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(values) })).data,
    remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE' })
  };
}

export const tasksApi = resourceApi('tasks');
export const notesApi = resourceApi('notes');
export const smartAssistApi = {
  run: async (mode, text) => (await request('/smart-assist', { method: 'POST', body: JSON.stringify({ mode, text }) })).data
};
