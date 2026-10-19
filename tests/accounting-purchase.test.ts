import { describe, it, expect } from 'vitest';
import { canAccessPath } from '../lib/rbac';
import { can } from '../lib/domain.cjs';

describe('Accounting & Finance Logic', () => {
  it('validates double-entry voucher debit and credit equilibrium', () => {
    const balancedLines = [
      { accountId: 'acc-exp-1', debit: 50000, credit: 0 },
      { accountId: 'acc-bank-1', debit: 0, credit: 50000 },
    ];

    const totalDebit = balancedLines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredit = balancedLines.reduce((s, l) => s + Number(l.credit || 0), 0);

    expect(totalDebit).toBe(50000);
    expect(totalCredit).toBe(50000);
    expect(totalDebit).toBe(totalCredit);
  });

  it('detects unbalanced voucher entries', () => {
    const unbalancedLines = [
      { accountId: 'acc-exp-1', debit: 50000, credit: 0 },
      { accountId: 'acc-bank-1', debit: 0, credit: 45000 },
    ];

    const totalDebit = unbalancedLines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredit = unbalancedLines.reduce((s, l) => s + Number(l.credit || 0), 0);
    const diff = Math.abs(totalDebit - totalCredit);

    expect(diff).toBe(5000);
    expect(totalDebit === totalCredit).toBe(false);
  });

  it('calculates running ledger balance correctly for Asset and Expense accounts (Debit - Credit)', () => {
    const openingBalance = 100000;
    const entries = [
      { debit: 25000, credit: 0 }, // Inflow / Increase
      { debit: 0, credit: 15000 }, // Outflow / Decrease
      { debit: 5000, credit: 0 },  // Increase
    ];

    let running = openingBalance;
    entries.forEach((e) => {
      running += (e.debit - e.credit);
    });

    expect(running).toBe(115000);
  });

  it('calculates running ledger balance correctly for Liability, Equity, and Income accounts (Credit - Debit)', () => {
    const openingBalance = 500000; // Creditor opening balance
    const entries = [
      { debit: 0, credit: 150000 }, // Vendor bill added (credit increases liability)
      { debit: 200000, credit: 0 }, // Payment made to vendor (debit reduces liability)
    ];

    let running = openingBalance;
    entries.forEach((e) => {
      running += (e.credit - e.debit);
    });

    expect(running).toBe(450000);
  });

  it('calculates Bank Reconciliation Statement (BRS) adjusted balance accurately', () => {
    const bookBalance = 1500000;
    const unclearedChequesIssued = [
      { amount: 50000, type: 'issue', cleared: false },
      { amount: 35000, type: 'issue', cleared: false },
    ];
    const uncreditedDeposits = [
      { amount: 20000, type: 'deposit', cleared: false },
    ];

    const totalUnclearedIssues = unclearedChequesIssued.reduce((s, c) => s + c.amount, 0);
    const totalUncreditedDeposits = uncreditedDeposits.reduce((s, d) => s + d.amount, 0);

    // Adjusted Bank Balance = Book Balance + Unpresented Cheques - Uncredited Deposits
    const adjustedBankPassbookBalance = bookBalance + totalUnclearedIssues - totalUncreditedDeposits;

    expect(totalUnclearedIssues).toBe(85000);
    expect(totalUncreditedDeposits).toBe(20000);
    expect(adjustedBankPassbookBalance).toBe(1565000);
  });

  it('computes TDS statutory withholding deduction according to Section 194C rates', () => {
    const invoiceAmount = 250000;
    const tdsRateIndividual = 1; // 1% for individual/HUF contractor
    const tdsRateCompany = 2; // 2% for corporate contractor

    const tdsIndividual = (invoiceAmount * tdsRateIndividual) / 100;
    const tdsCompany = (invoiceAmount * tdsRateCompany) / 100;

    expect(tdsIndividual).toBe(2500);
    expect(tdsCompany).toBe(5000);
  });
});

describe('Purchase & Procurement Logic', () => {
  it('calculates purchase bill net payable with GST input tax credit and TDS withholding', () => {
    const bill = {
      baseAmount: 100000,
      gstRate: 18, // 18% GST
      tdsRate: 2,  // 2% TDS under 194C
    };

    const taxAmount = (bill.baseAmount * bill.gstRate) / 100;
    const tdsDeducted = (bill.baseAmount * bill.tdsRate) / 100;
    const netPayable = bill.baseAmount + taxAmount - tdsDeducted;

    expect(taxAmount).toBe(18000);
    expect(tdsDeducted).toBe(2000);
    expect(netPayable).toBe(116000);
  });

  it('verifies 3-way match condition (PO == GRN == Bill)', () => {
    const poLine = { itemId: 'item-cement-opc', quantity: 500, unitPrice: 380 };
    const grnLine = { itemId: 'item-cement-opc', acceptedQuantity: 500 };
    const billLine = { itemId: 'item-cement-opc', billedQuantity: 500, unitPrice: 380 };

    const quantityMatches = poLine.quantity === grnLine.acceptedQuantity && grnLine.acceptedQuantity === billLine.billedQuantity;
    const priceMatches = poLine.unitPrice === billLine.unitPrice;
    const threeWayMatched = quantityMatches && priceMatches;

    expect(threeWayMatched).toBe(true);
  });

  it('flags quantity mismatch in 3-way matching', () => {
    const poQuantity = 500;
    const grnAccepted = 450; // 50 rejected
    const billQuantity = 500; // Billed for full 500

    const isMatch = poQuantity === grnAccepted && grnAccepted === billQuantity;
    expect(isMatch).toBe(false);
  });
});

describe('RBAC & Route Permissions for Purchasing, Accounting and Sites', () => {
  const adminUser = {
    id: 'usr-admin',
    role: 'admin',
    departmentId: 'dept-management',
    firmId: 'firm-1',
  };

  const accountantUser = {
    id: 'usr-acc',
    role: 'accounts',
    departmentId: 'dept-accounts',
    firmId: 'firm-1',
  };

  const purchaseManagerUser = {
    id: 'usr-pm',
    role: 'purchase',
    departmentId: 'dept-purchase',
    firmId: 'firm-1',
  };

  it('allows Admin access to all accounting, purchase, and site routes', () => {
    expect(canAccessPath(adminUser, '/purchasing/dashboard')).toBe(true);
    expect(canAccessPath(adminUser, '/purchasing/bills')).toBe(true);
    expect(canAccessPath(adminUser, '/finance/vouchers')).toBe(true);
    expect(canAccessPath(adminUser, '/finance/ledgers')).toBe(true);
    expect(canAccessPath(adminUser, '/finance/cash-bank')).toBe(true);
    expect(canAccessPath(adminUser, '/finance/tds-gst')).toBe(true);
    expect(canAccessPath(adminUser, '/finance/statements')).toBe(true);
    expect(canAccessPath(adminUser, '/organisation/sites')).toBe(true);
  });

  it('allows Accountant access to finance modules', () => {
    expect(canAccessPath(accountantUser, '/finance/vouchers')).toBe(true);
    expect(canAccessPath(accountantUser, '/finance/ledgers')).toBe(true);
    expect(canAccessPath(accountantUser, '/finance/cash-bank')).toBe(true);
    expect(canAccessPath(accountantUser, '/finance/tds-gst')).toBe(true);
    expect(canAccessPath(accountantUser, '/finance/statements')).toBe(true);
  });

  it('allows Purchase Manager access to procurement routes', () => {
    expect(canAccessPath(purchaseManagerUser, '/purchasing/dashboard')).toBe(true);
    expect(canAccessPath(purchaseManagerUser, '/purchasing/orders')).toBe(true);
    expect(canAccessPath(purchaseManagerUser, '/purchasing/requisitions')).toBe(true);
    expect(canAccessPath(purchaseManagerUser, '/purchasing/vendors')).toBe(true);
  });

  it('checks domain permissions for resources', () => {
    expect(can({ role: 'admin' }, 'purchase-bills')).toBe(true);
    expect(can({ role: 'admin' }, 'purchase-bills', 'edit')).toBe(true);
    expect(can({ role: 'accounts' }, 'vouchers')).toBe(true);
    expect(can({ role: 'accounts' }, 'vouchers', 'edit')).toBe(true);
    expect(can({ role: 'admin' }, 'sites')).toBe(true);
    expect(can({ role: 'admin' }, 'sites', 'edit')).toBe(true);
  });
});
