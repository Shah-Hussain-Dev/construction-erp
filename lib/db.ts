import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import seedData from '@/mocks/data/seed.json';
import { documents, approvalResources, can, visible, validateDocument } from '@/lib/domain.cjs';
import type { User, RecordData } from '@/schemas';

export type DatabaseState = Record<string, any[]>;

const GLOBAL_KEY = '__civilErpDbState__';

function getStorageFilePath(): string | null {
  if (process.env.MOCK_DB_FILE) {
    return process.env.MOCK_DB_FILE;
  }
  // Try local dev db file in project directory
  try {
    const localDir = path.join(process.cwd(), 'mocks', 'data');
    if (fs.existsSync(localDir)) {
      const localFile = path.join(localDir, 'db.json');
      return localFile;
    }
  } catch {}
  // In serverless / Netlify / AWS Lambda, use /tmp
  try {
    const tmpDir = os.tmpdir();
    if (tmpDir && fs.existsSync(tmpDir)) {
      return path.join(tmpDir, 'civil-erp-db.json');
    }
  } catch {}
  return null;
}

function loadState(): DatabaseState {
  const g = globalThis as unknown as { [GLOBAL_KEY]?: DatabaseState };
  if (g[GLOBAL_KEY]) {
    return g[GLOBAL_KEY]!;
  }

  const filePath = getStorageFilePath();
  if (filePath && fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        g[GLOBAL_KEY] = parsed;
        return parsed;
      }
    } catch {
      // Fallback if parsing failed
    }
  }

  // Deep clone seedData to avoid mutating the imported module
  const initial = structuredClone(seedData) as DatabaseState;
  g[GLOBAL_KEY] = initial;

  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {
      // Read-only filesystem in some serverless platforms; in-memory fallback is safe
    }
  }

  return initial;
}

function saveState(state: DatabaseState): void {
  const g = globalThis as unknown as { [GLOBAL_KEY]?: DatabaseState };
  g[GLOBAL_KEY] = state;

  const filePath = getStorageFilePath();
  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch {
      // In-memory persistence on globalThis will continue to serve requests during container lifetime
    }
  }
}

export function getDbState(): DatabaseState {
  return loadState();
}

export function getUsers(): User[] {
  const state = loadState();
  return (state.users || []) as User[];
}

export function getResource(resource: string): RecordData[] | undefined {
  const state = loadState();
  return state[resource] ? (state[resource] as RecordData[]) : undefined;
}

export interface CommandResult {
  status: number;
  data: any;
}

export function executeCommand(user: User, body: any): CommandResult {
  try {
    const state = loadState();
    const { resource, action, id, input = {}, operationId } = body;
    if (!operationId || typeof operationId !== 'string') {
      throw new Error('An operation ID is required.');
    }

    if (!state.operations) state.operations = [];
    const prior = state.operations.find((o: any) => o.id === operationId && o.userId === user.id);
    if (prior) return { status: 200, data: prior.result };

    if (resource === 'notifications' && action === 'read') {
      const notice = (state.notifications || []).find((n: any) => n.id === id && visible(user, n));
      if (!notice) throw new Error('Notification not found.');
      notice.read = true;
      saveState(state);
      return { status: 200, data: notice };
    }

    if (resource === 'stock-balances' && action === 'import') {
      if (!can(user, 'items', 'create') || !visible(user, input)) {
        return { status: 403, data: { message: 'Import is not allowed.' } };
      }
      if (!Array.isArray(input.rows) || !input.rows.length || input.rows.length > 500) {
        throw new Error('Import 1–500 rows.');
      }
      const now = new Date().toISOString();
      if (!state['stock-balances']) state['stock-balances'] = [];
      if (!state['stock-ledger']) state['stock-ledger'] = [];
      if (!state.audit) state.audit = [];

      for (const row of input.rows) {
        const item = (state.items || []).find((i: any) => i.id === row.itemId);
        const store = (state.stores || []).find(
          (s: any) => s.id === row.storeId && s.siteId === input.siteId,
        );
        if (!item || !store || !Number.isFinite(row.quantity) || row.quantity < 0) {
          throw new Error('Invalid item, store or opening quantity. No rows were imported.');
        }
        if (
          state['stock-balances'].some(
            (b: any) => b.itemId === row.itemId && b.storeId === row.storeId,
          )
        ) {
          throw new Error('A balance already exists for this material and store.');
        }
        const scope = { siteId: store.siteId, projectId: store.projectId, firmId: store.firmId };
        const balance = {
          ...scope,
          id: randomUUID(),
          itemId: row.itemId,
          storeId: row.storeId,
          onHand: row.quantity,
          reserved: 0,
          status: 'active',
          createdAt: now,
        };
        state['stock-balances'].push(balance);
        state['stock-ledger'].push({
          ...scope,
          id: randomUUID(),
          itemId: row.itemId,
          storeId: row.storeId,
          qty: row.quantity,
          sourceId: operationId,
          sourceType: 'opening-stock',
          number: 'OPENING',
          date: now.slice(0, 10),
          createdAt: now,
          status: 'posted',
        });
        state.audit.push({
          ...scope,
          id: randomUUID(),
          resource: 'stock-balances',
          recordId: balance.id,
          actor: user.name,
          action: 'import',
          message: 'Opening stock imported',
          createdAt: now,
        });
      }
      const result = { id: operationId, name: 'Opening stock import', count: input.rows.length };
      state.operations.push({ id: operationId, userId: user.id, result });
      saveState(state);
      return { status: 200, data: result };
    }

    if (resource === 'items' && action === 'import') {
      if (!can(user, 'items', 'create')) {
        return { status: 403, data: { message: 'Import is not allowed.' } };
      }
      if (!Array.isArray(input.rows) || !input.rows.length || input.rows.length > 500) {
        throw new Error('Import between 1 and 500 rows.');
      }
      if (!visible(user, input)) throw new Error('Site is outside your access.');
      if (!state.items) state.items = [];
      if (!state.audit) state.audit = [];

      const codes = new Set((state.items || []).map((i: any) => String(i.code).toLowerCase()));
      for (const row of input.rows) {
        if (
          !row.name?.trim() ||
          !row.code?.trim() ||
          codes.has(row.code.toLowerCase()) ||
          !['BAG', 'MT', 'KG', 'CUM', 'SQM', 'NOS', 'LTR'].includes(row.uom) ||
          !Number.isFinite(row.reorderLevel) ||
          row.reorderLevel < 0
        ) {
          throw new Error('Invalid or duplicate import row. No records were imported.');
        }
        codes.add(row.code.toLowerCase());
        state.items.push({
          ...row,
          id: randomUUID(),
          siteId: input.siteId,
          projectId: input.projectId,
          firmId: input.firmId,
          status: 'active',
          createdAt: new Date().toISOString(),
        });
      }
      const result = { id: operationId, name: 'Material import', count: input.rows.length };
      state.operations.push({ id: operationId, userId: user.id, result });
      state.audit.push({
        id: randomUUID(),
        resource: 'items',
        recordId: state.items.at(-1).id,
        actor: user.name,
        action: 'import',
        message: `Imported ${input.rows.length} materials`,
        siteId: input.siteId,
        createdAt: new Date().toISOString(),
      });
      saveState(state);
      return { status: 200, data: result };
    }

    if (!can(user, resource, action)) {
      return { status: 403, data: { message: 'You do not have permission for this action.' } };
    }
    if (!Array.isArray(state[resource])) throw new Error('Unknown resource.');
    const now = new Date().toISOString();
    let record = id ? state[resource].find((r: any) => r.id === id && visible(user, r)) : null;
    if (id && !record) return { status: 404, data: { message: 'Record not found.' } };

    if (!state.audit) state.audit = [];
    if (!state.notifications) state.notifications = [];

    if (action === 'delete') {
      if (!record) throw new Error('Record not found.');
      const idx = state[resource].findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        state[resource].splice(idx, 1);
      }
      state.audit.push({
        id: randomUUID(),
        resource,
        recordId: id,
        actor: user.name,
        action: 'delete',
        message: `Deleted ${resource} record ${record.name || record.code || id}`,
        siteId: record.siteId || user.siteId,
        createdAt: now,
      });
      state.operations.push({ id: operationId, userId: user.id, result: { id, ok: true } });
      saveState(state);
      return { status: 200, data: { id, ok: true } };
    }

    if (['create', 'edit'].includes(action)) {
      if (record && !['draft', 'returned', 'active'].includes(record.status)) {
        throw new Error('This record is read-only.');
      }
      const clean = { ...input };
      delete clean.id;
      delete clean.number;
      delete clean.status;
      delete clean.createdAt;
      delete clean.requestedBy;
      if (!visible(user, clean)) throw new Error('This site is outside your access.');
      if (user.role === 'contractor') clean.contractorId = user.partyId;
      const site = (state.sites || []).find((s: any) => s.id === clean.siteId);
      if (resource !== 'sites' && site) {
        clean.projectId = site.projectId;
        clean.firmId = site.firmId;
      }
      if (documents.includes(resource)) validateDocument(resource, clean, false);
      else if (!['evidence', 'permissions'].includes(resource) && !clean.name?.trim()) {
        throw new Error('Name is required.');
      }
      if (resource === 'users') {
        if (!clean.role?.trim()) throw new Error('Choose a valid role.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email || '')) {
          throw new Error('A valid email is required.');
        }
        if ((state.users || []).some((u: any) => u.email === clean.email && u.id !== id)) {
          throw new Error('This email already exists.');
        }
        if (clean.siteId) clean.siteIds = [clean.siteId];
      }
      if (resource === 'evidence') {
        const linked = state[clean.recordType]?.find((r: any) => r.id === clean.recordId);
        if (!linked || !can(user, clean.recordType) || !visible(user, linked)) {
          throw new Error('Linked document is not accessible.');
        }
        if (!String(clean.image || '').startsWith('data:image/'))
          throw new Error('Choose a photo.');
        if (
          !clean.gps ||
          ((!Number.isFinite(clean.gps.latitude) || !Number.isFinite(clean.gps.longitude)) &&
            !clean.gps.exceptionReason?.trim())
        ) {
          throw new Error('Location or exception reason is required.');
        }
      }
      if (record) {
        Object.assign(record, clean, { updatedAt: now });
      } else {
        record = {
          ...clean,
          id: randomUUID(),
          number: documents.includes(resource)
            ? `${input.prefix || 'DOC'}-26-${String(state[resource].length + 1).padStart(4, '0')}`
            : undefined,
          status: documents.includes(resource) ? 'draft' : 'active',
          requestedBy: user.id,
          createdAt: now,
          updatedAt: now,
        };
        delete record.prefix;
        state[resource].push(record);
      }
    } else {
      if (!record) throw new Error('Record not found.');
      if (action === 'submit') {
        if (!['draft', 'returned'].includes(record.status)) {
          throw new Error('Only drafts or returned records can be submitted.');
        }
        validateDocument(resource, record);
        record.status = 'submitted';
      } else if (['approve', 'reject', 'return'].includes(action)) {
        if (
          !approvalResources.includes(resource) ||
          !['submitted', 'under_review'].includes(record.status)
        ) {
          throw new Error('This document is not awaiting approval.');
        }
        if (action !== 'approve' && !input.comment?.trim())
          throw new Error('A reason is required.');
        record.status =
          action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned';
        if (resource === 'material-requests' && action === 'approve') {
          record.lines.forEach((l: any) => {
            const value = input.approvedQuantities?.[l.id] ?? l.qtyRequested.value;
            if (!Number.isFinite(value) || value < 0 || value > l.qtyRequested.value) {
              throw new Error('Approved quantity must be between zero and the requested quantity.');
            }
            l.qtyApproved = { value, uom: l.qtyRequested.uom };
          });
          if (!record.lines.some((l: any) => l.qtyApproved.value > 0)) {
            throw new Error('Approve at least one positive quantity, or reject the request.');
          }
        }
      } else if (action === 'post') {
        if (
          !['grn', 'material-issues', 'stock-transfers', 'vouchers'].includes(resource) ||
          !['draft', 'submitted'].includes(record.status)
        ) {
          throw new Error('This document cannot be posted.');
        }
        validateDocument(resource, record);
        const itemMap = new Map((state.items || []).map((i: any) => [i.id, i]));
        const balance = (itemId: string, storeId: string) => {
          if (!state['stock-balances']) state['stock-balances'] = [];
          let b = state['stock-balances'].find(
            (b: any) => b.itemId === itemId && b.storeId === storeId,
          );
          if (!b) {
            b = {
              id: randomUUID(),
              itemId,
              storeId,
              siteId: record.siteId,
              projectId: record.projectId,
              firmId: record.firmId,
              onHand: 0,
              reserved: 0,
            };
            state['stock-balances'].push(b);
          }
          return b;
        };
        if (resource !== 'vouchers') {
          for (const storeId of [
            record.storeId,
            ...(resource === 'stock-transfers' ? [record.toStoreId] : []),
          ]) {
            const store = (state.stores || []).find((s: any) => s.id === storeId);
            if (!store || store.siteId !== record.siteId) {
              throw new Error('Store must belong to the selected site.');
            }
          }
          if (!state['stock-ledger']) state['stock-ledger'] = [];
          for (const line of record.lines || []) {
            if (!itemMap.has(line.itemId)) throw new Error('Material not found.');
            const qty = Number(line.qty ?? line.qtyRequested?.value ?? 0);
            const b = balance(line.itemId, record.storeId);
            const inward = resource === 'grn';
            if (!inward && b.onHand < qty) {
              throw new Error('Insufficient stock. Refresh and reduce the issue quantity.');
            }
            if (resource === 'material-issues') {
              const request = (state['material-requests'] || []).find(
                (r: any) => r.id === record.requestId && r.siteId === record.siteId,
              );
              if (!request || !['approved', 'partial'].includes(request.status)) {
                throw new Error('Choose an approved or partially fulfilled request.');
              }
              const rl = request.lines.find((l: any) => l.itemId === line.itemId);
              if (
                !rl ||
                qty > Number(rl.qtyApproved?.value || 0) - Number(rl.qtyIssued?.value || 0)
              ) {
                throw new Error('Issue quantity exceeds the approved remaining quantity.');
              }
              rl.qtyIssued = {
                value: Number(rl.qtyIssued?.value || 0) + qty,
                uom: rl.qtyRequested.uom,
              };
              request.status = request.lines.every(
                (l: any) => Number(l.qtyIssued?.value || 0) >= Number(l.qtyApproved?.value || 0),
              )
                ? 'fulfilled'
                : 'partial';
              request.updatedAt = now;
            }
            if (resource === 'grn' && record.orderId) {
              const order = (state['purchase-orders'] || []).find(
                (o: any) => o.id === record.orderId && o.siteId === record.siteId,
              );
              if (!order || !['approved', 'partial'].includes(order.status)) {
                throw new Error('Choose an approved purchase order.');
              }
              const ol = order.lines.find((l: any) => l.itemId === line.itemId);
              if (!ol || qty > Number(ol.qty) - Number(ol.received || 0)) {
                throw new Error('Receipt exceeds the remaining ordered quantity.');
              }
              ol.received = Number(ol.received || 0) + qty;
              order.status = order.lines.every((l: any) => (l.received || 0) >= l.qty)
                ? 'fulfilled'
                : 'partial';
            }
            b.onHand = Math.round((b.onHand + (inward ? qty : -qty)) * 1000) / 1000;
            const movement = {
              id: randomUUID(),
              itemId: line.itemId,
              storeId: record.storeId,
              siteId: record.siteId,
              projectId: record.projectId,
              firmId: record.firmId,
              qty: inward ? qty : -qty,
              sourceId: record.id,
              sourceType: resource,
              number: record.number,
              date: record.date,
              createdAt: now,
              status: 'posted',
            };
            state['stock-ledger'].push(movement);
            if (resource === 'stock-transfers') {
              balance(line.itemId, record.toStoreId).onHand += qty;
              state['stock-ledger'].push({
                ...movement,
                id: randomUUID(),
                storeId: record.toStoreId,
                qty,
              });
            }
          }
        }
        record.status = 'posted';
      } else {
        throw new Error('Unknown action.');
      }
      record.updatedAt = now;
    }

    if (resource === 'contractor-bills') {
      const wo = (state['work-orders'] || []).find(
        (w: any) =>
          w.id === record.workOrderId &&
          w.contractorId === record.contractorId &&
          w.siteId === record.siteId,
      );
      if (!wo || wo.status !== 'approved') {
        throw new Error('Choose an approved work order for this contractor and site.');
      }
    }
    if (documents.includes(resource)) {
      for (const line of record.lines || []) {
        if (
          resource === 'vouchers' &&
          !(state.ledgers || []).some((l: any) => l.id === line.accountId)
        ) {
          throw new Error('Account not found.');
        }
        if (line.itemId && !(state.items || []).some((i: any) => i.id === line.itemId)) {
          throw new Error('Material not found.');
        }
      }
    }
    if (
      resource === 'contractor-bills' &&
      ['create', 'edit', 'submit', 'approve'].includes(action)
    ) {
      const workOrder = (state['work-orders'] || []).find((w: any) => w.id === record.workOrderId);
      for (const line of record.lines || []) {
        const agreed = workOrder?.lines?.find((l: any) => l.description === line.description);
        if (!agreed || Number(agreed.rate) !== Number(line.rate)) {
          throw new Error('Use a work item and rate from the selected work order.');
        }
        const previous = (state['contractor-bills'] || [])
          .filter(
            (b: any) =>
              b.id !== record.id &&
              b.workOrderId === record.workOrderId &&
              ['approved', 'paid', 'partially_paid'].includes(b.status),
          )
          .flatMap((b: any) => b.lines || [])
          .filter((l: any) => l.description === line.description)
          .reduce((sum: number, l: any) => sum + Number(l.qty), 0);
        if (previous + Number(line.qty) > Number(agreed.qty)) {
          throw new Error('Cumulative quantity exceeds the agreed work order.');
        }
        line.previous = previous;
      }
    }
    state.audit.push({
      id: randomUUID(),
      resource,
      recordId: record.id,
      actor: user.name,
      action,
      message: input.comment || `${action} · ${record.number || record.name || 'Evidence'}`,
      siteId: record.siteId,
      createdAt: now,
    });
    if (['submit', 'approve', 'reject', 'return', 'post'].includes(action)) {
      state.notifications.push({
        id: randomUUID(),
        name: `${record.number} ${record.status}`,
        resource,
        recordId: record.id,
        contractorId: record.contractorId,
        message: input.comment || 'Document status updated',
        siteId: record.siteId,
        read: false,
        createdAt: now,
      });
    }
    state.operations.push({ id: operationId, userId: user.id, result: record });
    state.operations = state.operations.slice(-500);
    saveState(state);
    return { status: 200, data: record };
  } catch (error: any) {
    return { status: 400, data: { message: error.message || 'Operation failed.' } };
  }
}
