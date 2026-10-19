'use client';

import React from 'react';
import { inr, qty, label } from '@/lib/format';
import { Cube, Wallet, FileText, CheckCircle, Clock } from '@phosphor-icons/react';

export interface LineItem {
  id?: string;
  itemId?: string;
  accountId?: string;
  description?: string;
  uom?: string;
  qty?: number;
  rate?: number;
  debit?: number;
  credit?: number;
  previous?: number;
  detail?: string;
  qtyRequested?: { value: number; uom?: string };
  qtyApproved?: { value: number; uom?: string } | null;
  qtyIssued?: { value: number; uom?: string } | null;
  [key: string]: unknown;
}

export type EntityLookup = { id?: string; name?: string; [key: string]: unknown };

export interface LineItemsTableProps {
  lines: LineItem[];
  type: 'material' | 'bill' | 'voucher' | string;
  itemsMap?: EntityLookup[] | Map<string, { name?: string }> | Record<string, { name?: string }>;
  ledgersMap?: EntityLookup[] | Map<string, { name?: string }> | Record<string, { name?: string }>;
  resource?: string;
  totals?: {
    gross?: number;
    net?: number;
    [key: string]: unknown;
  };
  deductions?: Record<string, unknown>;
  readOnly?: boolean;
}

export function LineItemsTable({
  lines = [],
  type,
  itemsMap,
  ledgersMap,
  resource,
  totals: calculatedTotals,
  deductions,
}: LineItemsTableProps) {
  const getItemName = (id?: string) => {
    if (!id) return '';
    if (Array.isArray(itemsMap)) return itemsMap.find((i) => i.id === id)?.name || '';
    if (itemsMap instanceof Map) return itemsMap.get(id)?.name || '';
    if (itemsMap && typeof itemsMap === 'object') return (itemsMap as Record<string, { name?: string }>)[id]?.name || '';
    return '';
  };

  const getLedgerName = (id?: string) => {
    if (!id) return '';
    if (Array.isArray(ledgersMap)) return ledgersMap.find((l) => l.id === id)?.name || '';
    if (ledgersMap instanceof Map) return ledgersMap.get(id)?.name || '';
    if (ledgersMap && typeof ledgersMap === 'object') return (ledgersMap as Record<string, { name?: string }>)[id]?.name || '';
    return '';
  };

  if (!lines || lines.length === 0) {
    return (
      <div className="line-items-empty">
        <FileText size={28} className="text-slate-400" />
        <p>No line items recorded for this document.</p>
      </div>
    );
  }

  // Calculate voucher debit/credit totals
  const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit || 0), 0);

  return (
    <div className="line-items-container">
      <div className="line-items-scroll-wrapper" tabIndex={0} role="region" aria-label="Line items table">
        <table className="line-items-table">
          <thead>
            {type === 'voucher' ? (
              <tr>
                <th className="th-idx">#</th>
                <th className="th-desc">Account / Ledger</th>
                <th className="th-num">Debit</th>
                <th className="th-num">Credit</th>
              </tr>
            ) : type === 'bill' ? (
              <tr>
                <th className="th-idx">#</th>
                <th className="th-desc">Work Item Description</th>
                <th className="th-center">Unit</th>
                <th className="th-num">Prev Qty</th>
                <th className="th-num">This Bill</th>
                <th className="th-num">Cumul. Qty</th>
                <th className="th-num">Rate</th>
                <th className="th-num">Amount</th>
              </tr>
            ) : (
              /* Material Lines (Material Request, Purchase Order, GRN, Issue, Transfer) */
              <tr>
                <th className="th-idx">#</th>
                <th className="th-desc">Material / Item</th>
                <th className="th-center">Unit</th>
                <th className="th-num">Quantity</th>
                <th className="th-num">Rate</th>
                {resource === 'material-requests' && (
                  <th className="th-status">Fulfillment Status</th>
                )}
                <th className="th-num">Total Amount</th>
              </tr>
            )}
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const lineIndex = String(idx + 1).padStart(2, '0');

              if (type === 'voucher') {
                const ledgerName = getLedgerName(line.accountId) || 'Account';
                return (
                  <tr key={line.id || idx}>
                    <td className="td-idx font-mono">{lineIndex}</td>
                    <td className="td-desc">
                      <div className="line-item-meta">
                        <span className="line-item-icon wallet">
                          <Wallet size={16} weight="duotone" />
                        </span>
                        <div className="line-item-text">
                          <strong className="line-item-title">{ledgerName}</strong>
                          {line.description && (
                            <small className="line-item-sub">{line.description}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="td-num font-mono">
                      {Number(line.debit) > 0 ? (
                        <span className="text-slate-900 font-semibold">{inr(line.debit)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="td-num font-mono">
                      {Number(line.credit) > 0 ? (
                        <span className="text-slate-900 font-semibold">{inr(line.credit)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              }

              if (type === 'bill') {
                const prev = Number(line.previous || 0);
                const current = Number(line.qty || 0);
                const cumul = prev + current;
                const rate = Number(line.rate || 0);
                const lineAmount = current * rate;

                return (
                  <tr key={line.id || idx}>
                    <td className="td-idx font-mono">{lineIndex}</td>
                    <td className="td-desc">
                      <strong className="line-item-title">{line.description || 'Contract Work Item'}</strong>
                    </td>
                    <td className="td-center">
                      <span className="uom-pill font-mono">{line.uom || 'CUM'}</span>
                    </td>
                    <td className="td-num font-mono text-slate-500">{qty(prev)}</td>
                    <td className="td-num font-mono font-semibold text-slate-900">{qty(current)}</td>
                    <td className="td-num font-mono font-medium text-slate-700">{qty(cumul)}</td>
                    <td className="td-num font-mono text-slate-600">{inr(rate)}</td>
                    <td className="td-num font-mono font-bold text-slate-900">{inr(lineAmount)}</td>
                  </tr>
                );
              }

              // Standard Material Line
              const itemName =
                line.description ||
                getItemName(line.itemId) ||
                'Material Specification';
              const unit = line.uom || line.qtyRequested?.uom || 'NOS';
              const quantity = Number(line.qty ?? line.qtyRequested?.value ?? 0);
              const rate = Number(line.rate || 0);
              const totalAmount = quantity * rate;

              // Material Request fulfillment breakdown
              const reqApproved = Number(line.qtyApproved?.value || 0);
              const reqIssued = Number(line.qtyIssued?.value || 0);
              const reqRemaining = Math.max(0, reqApproved - reqIssued);

              return (
                <tr key={line.id || idx}>
                  <td className="td-idx font-mono">{lineIndex}</td>
                  <td className="td-desc">
                    <div className="line-item-meta">
                      <span className="line-item-icon cube">
                        <Cube size={16} weight="duotone" />
                      </span>
                      <div className="line-item-text">
                        <strong className="line-item-title">{itemName}</strong>
                        {line.detail && (
                          <small className="line-item-sub font-mono">{line.detail}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="td-center">
                    <span className="uom-pill font-mono">{unit}</span>
                  </td>
                  <td className="td-num font-mono font-bold text-slate-900">{qty(quantity)}</td>
                  <td className="td-num font-mono text-slate-600">{inr(rate)}</td>
                  {resource === 'material-requests' && (
                    <td className="td-status">
                      <div className="fulfillment-track">
                        <span className="track-step approved">
                          <CheckCircle size={12} weight="fill" />
                          <span>Appr: {qty(reqApproved)}</span>
                        </span>
                        <span className="track-divider">·</span>
                        <span className="track-step issued">
                          <Clock size={12} weight="bold" />
                          <span>Iss: {qty(reqIssued)}</span>
                        </span>
                        {reqRemaining > 0 && (
                          <>
                            <span className="track-divider">·</span>
                            <span className="track-step remaining">
                              <span>Rem: {qty(reqRemaining)}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="td-num font-mono font-bold text-slate-900">{inr(totalAmount)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {type === 'voucher' ? (
              <tr className="tfoot-totals-row">
                <td colSpan={2} className="text-right font-semibold text-slate-700">
                  Total Balanced Entries
                </td>
                <td className="td-num font-mono font-bold text-slate-900">{inr(totalDebit)}</td>
                <td className="td-num font-mono font-bold text-slate-900">{inr(totalCredit)}</td>
              </tr>
            ) : calculatedTotals ? (
              <tr className="tfoot-totals-row">
                <td
                  colSpan={
                    type === 'bill'
                      ? 7
                      : resource === 'material-requests'
                        ? 6
                        : 5
                  }
                  className="text-right font-semibold text-slate-700"
                >
                  Gross Document Total
                </td>
                <td className="td-num font-mono font-bold text-slate-900">
                  {inr(calculatedTotals.gross || 0)}
                </td>
              </tr>
            ) : null}
          </tfoot>
        </table>
      </div>

      {/* Bill Deductions & Net Breakdown */}
      {type === 'bill' && deductions && (
        <div className="line-items-summary-card">
          <div className="summary-breakdown">
            <div className="summary-row">
              <span className="summary-label">Gross Certified Amount</span>
              <span className="summary-value font-mono">{inr(calculatedTotals?.gross)}</span>
            </div>

            {Object.entries(deductions).map(([key, val]) => {
              const numVal = Number(val || 0);
              if (numVal <= 0) return null;
              return (
                <div className="summary-row deduction-row" key={key}>
                  <span className="summary-label text-slate-600">
                    Less: {label(key)}
                  </span>
                  <span className="summary-value font-mono text-rose-600 font-medium">
                    − {inr(numVal)}
                  </span>
                </div>
              );
            })}

            <div className="summary-row net-row">
              <span className="summary-label font-bold text-slate-900">
                Net Certified Payable
              </span>
              <span className="summary-value font-mono font-extrabold text-slate-900">
                {inr(calculatedTotals?.net)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
