import { describe, it, expect } from 'vitest';
import { can, visible, validateDocument, totals } from '../lib/domain.cjs';
const scope = { firmId: 'firm', projectId: 'project', siteId: 'site' };
describe('financial and workflow rules', () => {
  it('balances vouchers in paise rather than floating-point sums', () => {
    expect(() =>
      validateDocument('vouchers', {
        ...scope,
        lines: [
          { accountId: 'a', debit: 0.1, credit: 0 },
          { accountId: 'a', debit: 0.2, credit: 0 },
          { accountId: 'b', debit: 0, credit: 0.3 },
        ],
      }),
    ).not.toThrow();
  });
  it('rejects unbalanced or two-sided voucher entries', () => {
    expect(() =>
      validateDocument('vouchers', {
        ...scope,
        lines: [
          { accountId: 'a', debit: 100, credit: 0 },
          { accountId: 'b', debit: 0, credit: 99 },
        ],
      }),
    ).toThrow('balance');
    expect(() =>
      validateDocument('vouchers', { ...scope, lines: [{ accountId: 'a', debit: 1, credit: 1 }] }),
    ).toThrow('either');
  });
  it('calculates current bill value and all deductions', () =>
    expect(
      totals({
        lines: [{ qty: 180, previous: 120, rate: 1800 }],
        advance: 20000,
        retention: 16200,
        tds: 3240,
        materialRecovery: 0,
        penalty: 0,
      }),
    ).toEqual({ gross: 324000, deductions: 39440, net: 284560 }));
  it('rejects negative quantities and deductions exceeding gross', () => {
    expect(() =>
      validateDocument('material-requests', {
        ...scope,
        lines: [{ itemId: 'item', qty: -2, rate: 1 }],
      }),
    ).toThrow('greater');
    expect(() =>
      validateDocument('contractor-bills', {
        ...scope,
        workOrderId: 'wo',
        contractorId: 'c',
        retention: 200,
        lines: [{ description: 'Work', qty: 1, rate: 100 }],
      }),
    ).toThrow('exceed');
  });
});
describe('role and record access', () => {
  it.each(['supervisor', 'store', 'purchase', 'contractor', 'client'])(
    '%s cannot read internal finance',
    (role) => expect(can({ role }, 'vouchers')).toBe(false),
  );
  it('limits approval to owner/manager', () => {
    expect(can({ role: 'manager' }, 'material-requests', 'approve')).toBe(true);
    expect(can({ role: 'supervisor' }, 'material-requests', 'approve')).toBe(false);
  });
  it('isolates contractor records and assigned sites', () => {
    const user = { role: 'contractor', partyId: 'a', siteIds: ['one'] };
    expect(visible(user, { siteId: 'one', contractorId: 'a' })).toBe(true);
    expect(visible(user, { siteId: 'one', contractorId: 'b' })).toBe(false);
    expect(visible(user, { siteId: 'two', contractorId: 'a' })).toBe(false);
  });
});
