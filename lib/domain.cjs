const documents = [
  'material-requests',
  'purchase-requisitions',
  'purchase-orders',
  'grn',
  'material-issues',
  'stock-transfers',
  'work-orders',
  'contractor-bills',
  'vouchers',
];
const approvalResources = [
  'material-requests',
  'purchase-requisitions',
  'purchase-orders',
  'work-orders',
  'contractor-bills',
];
const masterResources = [
  'firms',
  'projects',
  'sites',
  'stores',
  'cost-codes',
  'users',
  'items',
  'vendors',
  'contractors',
  'ledgers',
  'departments',
  'roles',
  'permissions',
  'equipment',
  'clients',
  'purchase-bills',
  'bank-accounts',
  'tax-records',
];
function can(user, resource, action = 'view') {
  if (!user) return false;
  if (user.role === 'owner' || user.role === 'admin') return true;
  if (['contractor', 'client'].includes(user.role))
    return action === 'view'
      ? [
          'projects',
          'sites',
          'firms',
          'contractors',
          'work-orders',
          'contractor-bills',
          'notifications',
          'evidence',
          'audit',
        ].includes(resource)
      : user.role === 'contractor' &&
          ['contractor-bills', 'evidence'].includes(resource) &&
          ['create', 'edit', 'submit'].includes(action);
  if (action === 'view') {
    if (resource === 'users') return false;
    const viewRights = {
      manager: [
        'firms',
        'projects',
        'sites',
        'stores',
        'cost-codes',
        'items',
        'vendors',
        'contractors',
        'material-requests',
        'purchase-requisitions',
        'purchase-orders',
        'grn',
        'purchase-bills',
        'material-issues',
        'stock-transfers',
        'stock-balances',
        'stock-ledger',
        'work-orders',
        'contractor-bills',
        'departments',
        'roles',
        'permissions',
        'equipment',
        'clients',
        'bank-accounts',
        'tax-records',
        'notifications',
        'evidence',
        'audit',
      ],
      supervisor: [
        'projects',
        'sites',
        'contractors',
        'material-requests',
        'stock-balances',
        'items',
        'equipment',
        'departments',
        'roles',
        'notifications',
        'evidence',
        'audit',
      ],
      store: [
        'sites',
        'stores',
        'items',
        'stock-balances',
        'stock-ledger',
        'material-requests',
        'purchase-orders',
        'grn',
        'material-issues',
        'stock-transfers',
        'vendors',
        'equipment',
        'notifications',
        'evidence',
        'audit',
      ],
      purchase: [
        'firms',
        'projects',
        'sites',
        'stores',
        'items',
        'stock-balances',
        'stock-ledger',
        'vendors',
        'material-requests',
        'purchase-requisitions',
        'purchase-orders',
        'grn',
        'purchase-bills',
        'notifications',
        'evidence',
        'audit',
      ],
      accounts: [
        'firms',
        'projects',
        'sites',
        'stores',
        'cost-codes',
        'items',
        'vendors',
        'contractors',
        'clients',
        'purchase-orders',
        'grn',
        'purchase-bills',
        'work-orders',
        'contractor-bills',
        'vouchers',
        'ledgers',
        'bank-accounts',
        'tax-records',
        'stock-balances',
        'stock-ledger',
        'notifications',
        'evidence',
        'audit',
      ],
    };
    return (viewRights[user.role] || []).includes(resource);
  }
  if (resource === 'evidence') return ['create', 'edit'].includes(action);
  if (action === 'approve' || action === 'reject' || action === 'return')
    return user.role === 'manager' && approvalResources.includes(resource);
  const rights = {
    supervisor: ['material-requests'],
    store: ['items', 'grn', 'material-issues', 'stock-transfers'],
    purchase: ['vendors', 'purchase-requisitions', 'purchase-orders', 'items', 'purchase-bills'],
    accounts: [
      'ledgers',
      'vouchers',
      'contractor-bills',
      'firms',
      'contractors',
      'clients',
      'purchase-bills',
      'bank-accounts',
      'tax-records',
    ],
    manager: [
      'firms',
      'projects',
      'sites',
      'cost-codes',
      'material-requests',
      'work-orders',
      'contractor-bills',
      'purchase-requisitions',
      'departments',
      'roles',
      'equipment',
      'clients',
      'purchase-bills',
      'bank-accounts',
      'tax-records',
    ],
  };
  return (
    (rights[user.role] || []).includes(resource) &&
    ['create', 'edit', 'submit', 'post', 'delete'].includes(action)
  );
}
function visible(user, r) {
  if (user.role === 'owner' || user.role === 'admin') return true;
  if (r.siteId && !(user.siteIds || [user.siteId]).includes(r.siteId)) return false;
  if (user.role === 'contractor' && r.contractorId && r.contractorId !== user.partyId) return false;
  return true;
}
const money = (n) => Math.round((Number(n) || 0) * 100) / 100;
function totals(doc) {
  const gross = money(
    (doc.lines || []).reduce(
      (sum, l) => sum + Number(l.qty ?? l.qtyRequested?.value ?? 0) * Number(l.rate || 0),
      0,
    ),
  );
  const deductions = money(
    ['advance', 'retention', 'tds', 'materialRecovery', 'penalty'].reduce(
      (s, k) => s + Number(doc[k] || 0),
      0,
    ),
  );
  return { gross, deductions, net: money(gross - deductions) };
}
function validateDocument(resource, doc, strict = true) {
  const fail = (msg) => {
    throw new Error(msg);
  };
  if (!doc.siteId || !doc.projectId || !doc.firmId) fail('Select a firm, project, and site.');
  if (!doc.lines?.length) fail('Add at least one line.');
  for (const l of doc.lines) {
    if (resource === 'vouchers') {
      if (!l.accountId) fail('Choose an account on every line.');
      if (
        !Number.isFinite(l.debit) ||
        !Number.isFinite(l.credit) ||
        l.debit < 0 ||
        l.credit < 0 ||
        (l.debit > 0 && l.credit > 0) ||
        l.debit + l.credit <= 0
      )
        fail('Enter either a debit or a credit on each line.');
    } else {
      const qty = Number(l.qty ?? l.qtyRequested?.value);
      if (!Number.isFinite(qty) || qty <= 0) fail('Every quantity must be greater than zero.');
      if (!Number.isFinite(Number(l.rate)) || Number(l.rate) < 0)
        fail('Rates must be zero or greater.');
      if (['work-orders', 'contractor-bills'].includes(resource)) {
        if (!l.description?.trim()) fail('Describe every work item.');
        if (!Number.isFinite(Number(l.previous || 0)) || Number(l.previous || 0) < 0)
          fail('Previous quantities must be zero or greater.');
      } else if (!l.itemId) fail('Choose a material on every line.');
    }
  }
  if (resource === 'vouchers' && strict) {
    const debit = doc.lines.reduce((s, l) => s + Math.round(l.debit * 100), 0),
      credit = doc.lines.reduce((s, l) => s + Math.round(l.credit * 100), 0);
    if (debit !== credit) fail('Debits and credits must balance before posting.');
  }
  if (resource === 'material-requests' && (!doc.purpose?.trim() || !doc.requiredOn))
    fail('Purpose and required date are required.');
  if (['grn', 'purchase-orders'].includes(resource) && !doc.vendorId) fail('Select a vendor.');
  if (['grn', 'material-issues', 'stock-transfers'].includes(resource) && !doc.storeId)
    fail('Select a store.');
  if (resource === 'material-issues' && !doc.requestId) fail('Select an approved request.');
  if (resource === 'stock-transfers' && (!doc.toStoreId || doc.toStoreId === doc.storeId))
    fail('Choose a different destination store.');
  if (['work-orders', 'contractor-bills'].includes(resource) && !doc.contractorId)
    fail('Select a contractor.');
  if (resource === 'contractor-bills') {
    if (!doc.workOrderId) fail('Select a work order.');
    for (const key of ['advance', 'retention', 'tds', 'materialRecovery', 'penalty'])
      if (!Number.isFinite(Number(doc[key] || 0)) || Number(doc[key] || 0) < 0)
        fail('Deductions cannot be negative.');
    if (totals(doc).net < 0) fail('Deductions exceed the gross bill.');
  }
}
module.exports = {
  documents,
  approvalResources,
  masterResources,
  can,
  visible,
  money,
  totals,
  validateDocument,
};
