import { describe, it, expect } from 'vitest';
import { getUsers, getResource, executeCommand } from '../lib/db';

describe('Direct JSON Database Store', () => {
  it('loads users from the bundled seed JSON data', () => {
    const users = getUsers();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    const admin = users.find((u) => u.email === 'admin@civil.example');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');

    const owner = users.find((u) => u.email === 'owner@civil.example');
    expect(owner).toBeDefined();
    expect(owner?.role).toBe('owner');
  });

  it('loads master and operational resources directly from JSON state', () => {
    const projects = getResource('projects');
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects!.length).toBeGreaterThan(0);

    const items = getResource('items');
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
    expect(items!.length).toBeGreaterThan(0);

    const sites = getResource('sites');
    expect(sites).toBeDefined();
    expect(sites!.length).toBeGreaterThan(0);
  });

  it('handles command execution directly in-memory without json-server', () => {
    const users = getUsers();
    const admin = users.find((u) => u.role === 'admin')!;
    const opId = 'test-op-' + Date.now();

    // Create a new vendor directly
    const result = executeCommand(admin, {
      resource: 'vendors',
      action: 'create',
      operationId: opId,
      input: {
        name: 'Direct JSON Test Vendor',
        code: 'TEST-VEND',
        siteId: admin.siteIds?.[0] || 'site',
      },
    });

    expect(result.status).toBe(200);
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('Direct JSON Test Vendor');

    // Verify it is now present in the resource list
    const vendors = getResource('vendors');
    const created = vendors?.find((v) => v.id === result.data.id);
    expect(created).toBeDefined();
    expect(created?.name).toBe('Direct JSON Test Vendor');
  });
});
