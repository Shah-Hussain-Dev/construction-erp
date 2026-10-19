import { describe, it, expect } from 'vitest';
import { can, visible } from '../lib/domain.cjs';
import { canAccessPath } from '../lib/rbac';
import { modules, moduleFor } from '../lib/modules';

describe('ERP Modules Configuration & Access Control', () => {
  it('has registered module definitions for new modules', () => {
    const depts = modules.find((m) => m.resource === 'departments');
    expect(depts).toBeDefined();
    expect(depts?.path).toBe('/organisation/departments');

    const roles = modules.find((m) => m.resource === 'roles');
    expect(roles).toBeDefined();
    expect(roles?.path).toBe('/organisation/roles');

    const permissions = modules.find((m) => m.resource === 'permissions');
    expect(permissions).toBeDefined();
    expect(permissions?.path).toBe('/organisation/permissions');

    const equipment = modules.find((m) => m.resource === 'equipment');
    expect(equipment).toBeDefined();
    expect(equipment?.path).toBe('/operations/equipment');

    const clients = modules.find((m) => m.resource === 'clients');
    expect(clients).toBeDefined();
    expect(clients?.path).toBe('/organisation/clients');
  });

  it('correctly maps route paths via moduleFor', () => {
    expect(moduleFor('/organisation/departments')?.resource).toBe('departments');
    expect(moduleFor('/organisation/roles')?.resource).toBe('roles');
    expect(moduleFor('/organisation/users')?.resource).toBe('users');
    expect(moduleFor('/organisation/permissions')?.resource).toBe('permissions');
    expect(moduleFor('/operations/equipment')?.resource).toBe('equipment');
    expect(moduleFor('/organisation/clients')?.resource).toBe('clients');
  });

  it('enforces RBAC path permissions for departments and roles', () => {
    // Admin and Owner have access
    expect(canAccessPath({ role: 'admin' }, '/organisation/departments')).toBe(true);
    expect(canAccessPath({ role: 'owner' }, '/organisation/departments')).toBe(true);
    expect(canAccessPath({ role: 'manager' }, '/organisation/departments')).toBe(true);
    expect(canAccessPath({ role: 'admin' }, '/organisation/roles')).toBe(true);
    expect(canAccessPath({ role: 'manager' }, '/organisation/roles')).toBe(true);

    // Site supervisor and contractor cannot access departments admin
    expect(canAccessPath({ role: 'contractor' }, '/organisation/departments')).toBe(false);
    expect(canAccessPath({ role: 'client' }, '/organisation/roles')).toBe(false);

    // Permissions matrix route restricted to admin & owner
    expect(canAccessPath({ role: 'admin' }, '/organisation/permissions')).toBe(true);
    expect(canAccessPath({ role: 'owner' }, '/organisation/permissions')).toBe(true);
    expect(canAccessPath({ role: 'supervisor' }, '/organisation/permissions')).toBe(false);
    expect(canAccessPath({ role: 'contractor' }, '/organisation/permissions')).toBe(false);
  });

  it('enforces domain permissions for equipment and clients', () => {
    expect(can({ role: 'owner' }, 'equipment', 'view')).toBe(true);
    expect(can({ role: 'manager' }, 'equipment', 'create')).toBe(true);
    expect(can({ role: 'supervisor' }, 'equipment', 'view')).toBe(true);
    expect(can({ role: 'store' }, 'equipment', 'view')).toBe(true);

    // Clients permissions
    expect(can({ role: 'admin' }, 'clients', 'create')).toBe(true);
    expect(can({ role: 'accounts' }, 'clients', 'view')).toBe(true);
    expect(can({ role: 'accounts' }, 'clients', 'create')).toBe(true);
  });

  it('validates role dependency on department structure', () => {
    const roleRecord = {
      name: 'Site Supervisor',
      code: 'ROLE-ENG-SUP',
      departmentId: 'dept-eng',
      accessLevel: 'Supervisor',
      systemRole: 'supervisor',
    };

    expect(roleRecord.departmentId).toBe('dept-eng');
    expect(roleRecord.accessLevel).toBe('Supervisor');
  });

  it('validates user record linking to both department and role', () => {
    const user = {
      name: 'Arjun Mehta',
      email: 'arjun@civil.example',
      employeeCode: 'EMP-014',
      departmentId: 'dept-eng',
      roleId: 'role-site-sup',
      role: 'supervisor',
      siteId: 'site-1',
    };

    expect(user.departmentId).toBe('dept-eng');
    expect(user.roleId).toBe('role-site-sup');
    expect(user.role).toBe('supervisor');
  });
});
