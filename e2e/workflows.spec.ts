import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
async function login(api: APIRequestContext, role = 'owner') {
  const r = await api.post('/api/auth/login', {
    data: { email: `${role}@civil.example`, password: 'demo' },
  });
  expect(r.ok()).toBeTruthy();
}
async function list(api: APIRequestContext, resource: string) {
  const r = await api.get(`/api/${resource}`);
  expect(r.ok()).toBeTruthy();
  return r.json();
}
async function command(
  api: APIRequestContext,
  resource: string,
  action: string,
  input: Record<string, unknown> = {},
  id?: string,
  operationId = randomUUID(),
) {
  const r = await api.post('/api/command', { data: { resource, action, input, id, operationId } });
  const body = await r.json();
  expect(r.ok(), JSON.stringify(body)).toBeTruthy();
  return body;
}
test('request to partial and full issue persists; posting is idempotent', async ({ request }) => {
  await login(request);
  const sites = await list(request, 'sites'),
    items = await list(request, 'items'),
    stores = await list(request, 'stores');
  const site = sites[0],
    item = items[0],
    store = stores[0];
  const scope = { siteId: site.id, projectId: site.projectId, firmId: site.firmId };
  const line = (qty: number) => ({
    id: randomUUID(),
    itemId: item.id,
    qty,
    rate: 390,
    qtyRequested: { value: qty, uom: item.uom },
  });
  const before = (await list(request, 'stock-balances')).find(
    (b: { itemId: string; storeId: string }) => b.itemId === item.id && b.storeId === store.id,
  ).onHand;
  const req = await command(request, 'material-requests', 'create', {
    ...scope,
    purpose: 'Automated material workflow',
    requiredOn: '2026-10-20',
    prefix: 'MR',
    lines: [line(6)],
  });
  await command(request, 'material-requests', 'submit', {}, req.id);
  await command(request, 'material-requests', 'approve', {}, req.id);
  const issue = await command(request, 'material-issues', 'create', {
    ...scope,
    requestId: req.id,
    storeId: store.id,
    date: '2026-10-16',
    prefix: 'ISS',
    lines: [line(2)],
  });
  const operation = randomUUID();
  await command(request, 'material-issues', 'post', {}, issue.id, operation);
  await command(request, 'material-issues', 'post', {}, issue.id, operation);
  expect((await (await request.get(`/api/material-requests/${req.id}`)).json()).status).toBe(
    'partial',
  );
  const invalid = await command(request, 'material-issues', 'create', {
    ...scope,
    requestId: req.id,
    storeId: store.id,
    date: '2026-10-16',
    lines: [line(8)],
  });
  const rejected = await request.post('/api/command', {
    data: {
      resource: 'material-issues',
      action: 'post',
      id: invalid.id,
      operationId: randomUUID(),
    },
  });
  expect(rejected.status()).toBe(400);
  const remaining = await command(request, 'material-issues', 'create', {
    ...scope,
    requestId: req.id,
    storeId: store.id,
    date: '2026-10-16',
    lines: [line(4)],
  });
  await command(request, 'material-issues', 'post', {}, remaining.id);
  expect((await (await request.get(`/api/material-requests/${req.id}`)).json()).status).toBe(
    'fulfilled',
  );
  expect(
    (await list(request, 'stock-balances')).find(
      (b: { itemId: string; storeId: string }) => b.itemId === item.id && b.storeId === store.id,
    ).onHand,
  ).toBe(before - 6);
});
test('purchase receipt updates stock and completes the linked order', async ({ request }) => {
  await login(request);
  const site = (await list(request, 'sites'))[0],
    item = (await list(request, 'items'))[0],
    store = (await list(request, 'stores'))[0],
    vendor = (await list(request, 'vendors'))[0];
  const scope = { siteId: site.id, projectId: site.projectId, firmId: site.firmId };
  const lines = [
    {
      id: randomUUID(),
      itemId: item.id,
      qty: 10,
      rate: 390,
      qtyRequested: { value: 10, uom: item.uom },
    },
  ];
  const po = await command(request, 'purchase-orders', 'create', {
    ...scope,
    vendorId: vendor.id,
    requiredOn: '2026-10-20',
    lines,
  });
  await command(request, 'purchase-orders', 'submit', {}, po.id);
  await command(request, 'purchase-orders', 'approve', {}, po.id);
  const grn = await command(request, 'grn', 'create', {
    ...scope,
    vendorId: vendor.id,
    storeId: store.id,
    orderId: po.id,
    lines,
  });
  await command(request, 'grn', 'post', {}, grn.id);
  expect((await (await request.get(`/api/purchase-orders/${po.id}`)).json()).status).toBe(
    'fulfilled',
  );
});
test('voucher balance checks reject invalid posts and lock valid posts', async ({ request }) => {
  await login(request);
  const site = (await list(request, 'sites'))[0],
    accounts = await list(request, 'ledgers');
  const fields = {
    siteId: site.id,
    projectId: site.projectId,
    firmId: site.firmId,
    type: 'journal',
    date: '2026-10-16',
    purpose: 'Automated balance check',
  };
  const voucher = await command(request, 'vouchers', 'create', {
    ...fields,
    lines: [
      { id: randomUUID(), accountId: accounts[0].id, debit: 100, credit: 0 },
      { id: randomUUID(), accountId: accounts[1].id, debit: 0, credit: 90 },
    ],
  });
  const failed = await request.post('/api/command', {
    data: { resource: 'vouchers', action: 'post', id: voucher.id, operationId: randomUUID() },
  });
  expect(failed.status()).toBe(400);
  await command(
    request,
    'vouchers',
    'edit',
    {
      ...fields,
      lines: [
        { id: randomUUID(), accountId: accounts[0].id, debit: 100, credit: 0 },
        { id: randomUUID(), accountId: accounts[1].id, debit: 0, credit: 100 },
      ],
    },
    voucher.id,
  );
  await command(request, 'vouchers', 'post', {}, voucher.id);
  const edit = await request.post('/api/command', {
    data: {
      resource: 'vouchers',
      action: 'edit',
      id: voucher.id,
      input: fields,
      operationId: randomUUID(),
    },
  });
  expect(edit.status()).toBe(400);
});
test('running bill preserves deductions through submission and approval', async ({ request }) => {
  await login(request);
  const wo = (await list(request, 'work-orders'))[0];
  const bill = await command(request, 'contractor-bills', 'create', {
    siteId: wo.siteId,
    projectId: wo.projectId,
    firmId: wo.firmId,
    contractorId: wo.contractorId,
    workOrderId: wo.id,
    advance: 10,
    retention: 10,
    tds: 10,
    materialRecovery: 10,
    penalty: 10,
    lines: [
      {
        id: randomUUID(),
        description: 'RCC concrete placement',
        qty: 2,
        previous: 0,
        rate: 1800,
        uom: 'CUM',
      },
    ],
  });
  await command(request, 'contractor-bills', 'submit', {}, bill.id);
  const approved = await command(request, 'contractor-bills', 'approve', {}, bill.id);
  expect(approved.status).toBe('approved');
  expect(approved.retention).toBe(10);
});
test('imports reject an entire batch when one row is invalid', async ({ request }) => {
  await login(request);
  const site = (await list(request, 'sites'))[0],
    before = await list(request, 'items');
  const r = await request.post('/api/command', {
    data: {
      resource: 'items',
      action: 'import',
      operationId: randomUUID(),
      input: {
        siteId: site.id,
        rows: [
          { name: 'Valid test material', code: randomUUID(), uom: 'BAG', reorderLevel: 10 },
          { name: 'Invalid material', code: randomUUID(), uom: 'BAD', reorderLevel: 0 },
        ],
      },
    },
  });
  expect(r.status()).toBe(400);
  expect((await list(request, 'items')).length).toBe(before.length);
});
test('opening stock import creates a balance and traceable movement without overwriting it', async ({
  request,
}) => {
  await login(request);
  const site = (await list(request, 'sites'))[0],
    item = (await list(request, 'items'))[0],
    store = (await list(request, 'stores'))[1];
  const input = { siteId: site.id, rows: [{ itemId: item.id, storeId: store.id, quantity: 12 }] };
  await command(request, 'stock-balances', 'import', input, 'batch');
  const before = (await list(request, 'stock-balances')).find(
    (b: { itemId: string; storeId: string }) => b.itemId === item.id && b.storeId === store.id,
  );
  expect(before.onHand).toBe(12);
  const bad = await request.post('/api/command', {
    data: {
      resource: 'stock-balances',
      action: 'import',
      id: 'batch',
      input,
      operationId: randomUUID(),
    },
  });
  expect(bad.status()).toBe(400);
});
test('GPS exception requires a reason and attachment persists', async ({ request }) => {
  await login(request);
  const req = (await list(request, 'material-requests'))[0];
  const input = {
    name: 'Test evidence',
    recordType: 'material-requests',
    recordId: req.id,
    siteId: req.siteId,
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=',
    gps: {
      latitude: null,
      longitude: null,
      permission: 'denied',
      exceptionReason: null,
      capturedAt: new Date().toISOString(),
    },
  };
  const bad = await request.post('/api/command', {
    data: { resource: 'evidence', action: 'create', input, operationId: randomUUID() },
  });
  expect(bad.status()).toBe(400);
  const evidence = await command(request, 'evidence', 'create', {
    ...input,
    gps: { ...input.gps, exceptionReason: 'Indoor capture; GPS unavailable' },
  });
  expect((await list(request, 'evidence')).some((r: { id: string }) => r.id === evidence.id)).toBe(
    true,
  );
});
