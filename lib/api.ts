import { z } from 'zod';
import { recordSchema, userSchema, type RecordData } from '@/schemas';
async function request(path: string, options?: RequestInit) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Unable to complete this action. Please retry.');
  return data;
}
export interface DataClient {
  list(resource: string): Promise<RecordData[]>;
  get(resource: string, id: string): Promise<RecordData>;
  save(
    resource: string,
    input: Record<string, unknown>,
    id?: string,
    operationId?: string,
  ): Promise<RecordData>;
  create(
    resource: string,
    input: Record<string, unknown>,
    operationId?: string,
  ): Promise<RecordData>;
  update(
    resource: string,
    id: string,
    input: Record<string, unknown>,
    operationId?: string,
  ): Promise<RecordData>;
  delete(resource: string, id: string, operationId?: string): Promise<{ id: string; ok: boolean }>;
  transition(
    resource: string,
    id: string,
    action: string,
    input?: Record<string, unknown>,
    operationId?: string,
  ): Promise<RecordData>;
}
export const dataClient: DataClient = {
  list: async (resource) => z.array(recordSchema).parse(await request(resource)),
  get: async (resource, id) => recordSchema.parse(await request(`${resource}/${id}`)),
  save: async (resource, input, id, operationId = crypto.randomUUID()) =>
    recordSchema.parse(
      await request('command', {
        method: 'POST',
        body: JSON.stringify({ resource, input, id, action: id ? 'edit' : 'create', operationId }),
      }),
    ),
  create: async (resource, input, operationId = crypto.randomUUID()) =>
    dataClient.save(resource, input, undefined, operationId),
  update: async (resource, id, input, operationId = crypto.randomUUID()) =>
    dataClient.save(resource, input, id, operationId),
  delete: async (resource, id, operationId = crypto.randomUUID()) =>
    request('command', {
      method: 'POST',
      body: JSON.stringify({ resource, id, action: 'delete', operationId }),
    }),
  transition: async (resource, id, action, input = {}, operationId = crypto.randomUUID()) =>
    recordSchema.parse(
      await request('command', {
        method: 'POST',
        body: JSON.stringify({ resource, id, action, input, operationId }),
      }),
    ),
};
export const auth = {
  me: async () => userSchema.parse(await request('auth/me')),
  login: async (email: string, password: string) =>
    userSchema.parse(
      await request('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    ),
  logout: () => request('auth/logout', { method: 'POST' }),
  reset: (email: string) =>
    request('auth/reset', { method: 'POST', body: JSON.stringify({ email }) }),
};
