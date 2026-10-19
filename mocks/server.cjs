/* json-server owns durable JSON storage; commands commit related changes together. */
const jsonServer = require('json-server');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const {
  documents,
  approvalResources,
  masterResources,
  can,
  visible,
  validateDocument,
} = require('../lib/domain.cjs');
const file = process.env.MOCK_DB_FILE || 'mocks/data/db.json';
if (!fs.existsSync(file)) fs.copyFileSync('mocks/data/seed.json', file);
const app = jsonServer.create(),
  router = jsonServer.router(file);
app.use(jsonServer.defaults({ logger: false }));
app.use(
  require(require.resolve('express', { paths: [require.resolve('json-server')] })).json({
    limit: '5mb',
  }),
);
app.post('/command', (req, res) => {
  try {
    const state = structuredClone(router.db.getState());
    const user = state.users.find((u) => u.id === req.headers['x-demo-user']);
    if (!user) return res.status(401).json({ message: 'Please sign in.' });
    const { resource, action, id, input = {}, operationId } = req.body;
    if (!operationId || typeof operationId !== 'string')
      throw Error('An operation ID is required.');
    const prior = state.operations.find((o) => o.id === operationId && o.userId === user.id);
    if (prior) return res.json(prior.result);
    if (resource === 'notifications' && action === 'read') {
      const notice = state.notifications.find((n) => n.id === id && visible(user, n));
      if (!notice) throw Error('Notification not found.');
      notice.read = true;
      router.db.setState(state).write();
      return res.json(notice);
    }
    if (resource === 'stock-balances' && action === 'import') {
      if (!can(user, 'items', 'create') || !visible(user, input))
        return res.status(403).json({ message: 'Import is not allowed.' });
      if (!Array.isArray(input.rows) || !input.rows.length || input.rows.length > 500)
        throw Error('Import 1–500 rows.');
      const now = new Date().toISOString();
      for (const row of input.rows) {
        const item = state.items.find((i) => i.id === row.itemId),
          store = state.stores.find((s) => s.id === row.storeId && s.siteId === input.siteId);
        if (!item || !store || !Number.isFinite(row.quantity) || row.quantity < 0)
          throw Error('Invalid item, store or opening quantity. No rows were imported.');
        if (
          state['stock-balances'].some((b) => b.itemId === row.itemId && b.storeId === row.storeId)
        )
          throw Error('A balance already exists for this material and store.');
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
      router.db.setState(state).write();
      return res.json(result);
    }
    if (resource === 'items' && action === 'import') {
      if (!can(user, 'items', 'create'))
        return res.status(403).json({ message: 'Import is not allowed.' });
      if (!Array.isArray(input.rows) || !input.rows.length || input.rows.length > 500)
        throw Error('Import between 1 and 500 rows.');
      if (!visible(user, input)) throw Error('Site is outside your access.');
      const codes = new Set(state.items.map((i) => String(i.code).toLowerCase()));
      for (const row of input.rows) {
        if (
          !row.name?.trim() ||
          !row.code?.trim() ||
          codes.has(row.code.toLowerCase()) ||
          !['BAG', 'MT', 'KG', 'CUM', 'SQM', 'NOS', 'LTR'].includes(row.uom) ||
          !Number.isFinite(row.reorderLevel) ||
          row.reorderLevel < 0
        )
          throw Error('Invalid or duplicate import row. No records were imported.');
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
      router.db.setState(state).write();
      return res.json(result);
    }
    if (!can(user, resource, action))
      return res.status(403).json({ message: 'You do not have permission for this action.' });
    if (!Array.isArray(state[resource])) throw Error('Unknown resource.');
    const now = new Date().toISOString();
    let record = id ? state[resource].find((r) => r.id === id && visible(user, r)) : null;
    if (id && !record) return res.status(404).json({ message: 'Record not found.' });
    if (action === 'delete') {
      if (!record) throw Error('Record not found.');
      const idx = state[resource].findIndex((r) => r.id === id);
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
      router.db.setState(state).write();
      return res.json({ id, ok: true });
    }
    if (['create', 'edit'].includes(action)) {
      if (record && !['draft', 'returned', 'active'].includes(record.status))
        throw Error('This record is read-only.');
      const clean = { ...input };
      delete clean.id;
      delete clean.number;
      delete clean.status;
      delete clean.createdAt;
      delete clean.requestedBy;
      if (!visible(user, clean)) throw Error('This site is outside your access.');
      if (user.role === 'contractor') clean.contractorId = user.partyId;
      const site = state.sites.find((s) => s.id === clean.siteId);
      if (resource !== 'sites' && site) {
        clean.projectId = site.projectId;
        clean.firmId = site.firmId;
      }
      if (documents.includes(resource)) validateDocument(resource, clean, false);
      else if (!['evidence', 'permissions'].includes(resource) && !clean.name?.trim())
        throw Error('Name is required.');
      if (resource === 'users') {
        if (!clean.role?.trim()) throw Error('Choose a valid role.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email || ''))
          throw Error('A valid email is required.');
        if (state.users.some((u) => u.email === clean.email && u.id !== id))
          throw Error('This email already exists.');
        if (clean.siteId) clean.siteIds = [clean.siteId];
      }
      if (resource === 'evidence') {
        const linked = state[clean.recordType]?.find((r) => r.id === clean.recordId);
        if (!linked || !can(user, clean.recordType) || !visible(user, linked))
          throw Error('Linked document is not accessible.');
        if (!String(clean.image || '').startsWith('data:image/')) throw Error('Choose a photo.');
        if (
          !clean.gps ||
          ((!Number.isFinite(clean.gps.latitude) || !Number.isFinite(clean.gps.longitude)) &&
            !clean.gps.exceptionReason?.trim())
        )
          throw Error('Location or exception reason is required.');
      }
      if (record) Object.assign(record, clean, { updatedAt: now });
      else {
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
      if (!record) throw Error('Record not found.');
      if (action === 'submit') {
        if (!['draft', 'returned'].includes(record.status))
          throw Error('Only drafts or returned records can be submitted.');
        validateDocument(resource, record);
        record.status = 'submitted';
      } else if (['approve', 'reject', 'return'].includes(action)) {
        if (
          !approvalResources.includes(resource) ||
          !['submitted', 'under_review'].includes(record.status)
        )
          throw Error('This document is not awaiting approval.');
        if (action !== 'approve' && !input.comment?.trim()) throw Error('A reason is required.');
        record.status =
          action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned';
        if (resource === 'material-requests' && action === 'approve') {
          record.lines.forEach((l) => {
            const value = input.approvedQuantities?.[l.id] ?? l.qtyRequested.value;
            if (!Number.isFinite(value) || value < 0 || value > l.qtyRequested.value)
              throw Error('Approved quantity must be between zero and the requested quantity.');
            l.qtyApproved = { value, uom: l.qtyRequested.uom };
          });
          if (!record.lines.some((l) => l.qtyApproved.value > 0))
            throw Error('Approve at least one positive quantity, or reject the request.');
        }
      } else if (action === 'post') {
        if (
          !['grn', 'material-issues', 'stock-transfers', 'vouchers'].includes(resource) ||
          !['draft', 'submitted'].includes(record.status)
        )
          throw Error('This document cannot be posted.');
        validateDocument(resource, record);
        const itemMap = new Map(state.items.map((i) => [i.id, i]));
        const balance = (itemId, storeId) => {
          let b = state['stock-balances'].find((b) => b.itemId === itemId && b.storeId === storeId);
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
            const store = state.stores.find((s) => s.id === storeId);
            if (!store || store.siteId !== record.siteId)
              throw Error('Store must belong to the selected site.');
          }
          for (const line of record.lines) {
            if (!itemMap.has(line.itemId)) throw Error('Material not found.');
            const qty = Number(line.qty ?? line.qtyRequested.value);
            const b = balance(line.itemId, record.storeId);
            const inward = resource === 'grn';
            if (!inward && b.onHand < qty)
              throw Error('Insufficient stock. Refresh and reduce the issue quantity.');
            if (resource === 'material-issues') {
              const request = state['material-requests'].find(
                (r) => r.id === record.requestId && r.siteId === record.siteId,
              );
              if (!request || !['approved', 'partial'].includes(request.status))
                throw Error('Choose an approved or partially fulfilled request.');
              const rl = request.lines.find((l) => l.itemId === line.itemId);
              if (
                !rl ||
                qty > Number(rl.qtyApproved?.value || 0) - Number(rl.qtyIssued?.value || 0)
              )
                throw Error('Issue quantity exceeds the approved remaining quantity.');
              rl.qtyIssued = {
                value: Number(rl.qtyIssued?.value || 0) + qty,
                uom: rl.qtyRequested.uom,
              };
              request.status = request.lines.every(
                (l) => Number(l.qtyIssued?.value || 0) >= Number(l.qtyApproved?.value || 0),
              )
                ? 'fulfilled'
                : 'partial';
              request.updatedAt = now;
            }
            if (resource === 'grn' && record.orderId) {
              const order = state['purchase-orders'].find(
                (o) => o.id === record.orderId && o.siteId === record.siteId,
              );
              if (!order || !['approved', 'partial'].includes(order.status))
                throw Error('Choose an approved purchase order.');
              const ol = order.lines.find((l) => l.itemId === line.itemId);
              if (!ol || qty > Number(ol.qty) - Number(ol.received || 0))
                throw Error('Receipt exceeds the remaining ordered quantity.');
              ol.received = Number(ol.received || 0) + qty;
              order.status = order.lines.every((l) => (l.received || 0) >= l.qty)
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
      } else throw Error('Unknown action.');
      record.updatedAt = now;
    }
    if (resource === 'contractor-bills') {
      const wo = state['work-orders'].find(
        (w) =>
          w.id === record.workOrderId &&
          w.contractorId === record.contractorId &&
          w.siteId === record.siteId,
      );
      if (!wo || wo.status !== 'approved')
        throw Error('Choose an approved work order for this contractor and site.');
    }
    if (documents.includes(resource)) {
      for (const line of record.lines || []) {
        if (resource === 'vouchers' && !state.ledgers.some((l) => l.id === line.accountId))
          throw Error('Account not found.');
        if (line.itemId && !state.items.some((i) => i.id === line.itemId))
          throw Error('Material not found.');
      }
    }
    if (
      resource === 'contractor-bills' &&
      ['create', 'edit', 'submit', 'approve'].includes(action)
    ) {
      const workOrder = state['work-orders'].find((w) => w.id === record.workOrderId);
      for (const line of record.lines) {
        const agreed = workOrder.lines.find((l) => l.description === line.description);
        if (!agreed || Number(agreed.rate) !== Number(line.rate))
          throw Error('Use a work item and rate from the selected work order.');
        const previous = state['contractor-bills']
          .filter(
            (b) =>
              b.id !== record.id &&
              b.workOrderId === record.workOrderId &&
              ['approved', 'paid', 'partially_paid'].includes(b.status),
          )
          .flatMap((b) => b.lines)
          .filter((l) => l.description === line.description)
          .reduce((sum, l) => sum + Number(l.qty), 0);
        if (previous + Number(line.qty) > Number(agreed.qty))
          throw Error('Cumulative quantity exceeds the agreed work order.');
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
    if (['submit', 'approve', 'reject', 'return', 'post'].includes(action))
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
    state.operations.push({ id: operationId, userId: user.id, result: record });
    state.operations = state.operations.slice(-500);
    router.db.setState(state).write();
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.use(router);
app.listen(Number(process.env.MOCK_PORT || 3001), '127.0.0.1', () =>
  console.log('Civil ERP json-server on http://127.0.0.1:' + (process.env.MOCK_PORT || 3001)),
);
