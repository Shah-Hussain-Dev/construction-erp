'use client';

import React, { useState } from 'react';
import {
  FilePdf,
  Printer,
  QrCode,
  Truck,
  Bank,
  CheckCircle,
  ArrowsClockwise,
  FloppyDisk,
  Eye,
  Sliders,
  Buildings,
  Receipt,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import type { DocumentSettings, SiteConfig, BankAccount } from './types';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/primitives';

interface DocumentsInvoicesProps {
  settings: DocumentSettings;
  siteConfig: SiteConfig;
  onChange: (settings: DocumentSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

// ----------------------------------------------------------------------
// DUMMY PDF DATA (sample data used for every preview on this page)
// ----------------------------------------------------------------------
const DUMMY_SITE = {
  companyName: 'PRINCE CONSTRUCTIONS',
  tagline: 'Building Dreams • Creating Spaces',
  address: 'SALLAHPUR, BHATANI, DEORIA',
  email: 'princeconstructionmust@gmail.com',
  gstin: '09BKZPR3924E2ZH',
};

const DUMMY_SALES_BANK = {
  accountName: 'PRINCE CONSTRUCTION',
  bankName: 'IDBI BANK, MANOJ PANDEY CHAURAHA, GOMTINAGAR LKO',
  accountNumber: '0314653800000408',
  ifscCode: 'IBKL0000314',
  branch: 'LUCKNOW',
};

const DUMMY_SIGNATORY = 'SHYAM BEHARI MAHESHWARI';

const DUMMY_PURCHASE_TERMS = `1. Price as applicable on the date of dispatch shall be charged.
2. Payment should be made by "A/C Payee only" bank draft/cheque.
3. All disputes are subject to Kolkata jurisdiction only.`;

export function DocumentsInvoicesSection({
  settings,
  siteConfig,
  onChange,
  onSave,
  onReset,
}: DocumentsInvoicesProps) {
  const [activeTemplate, setActiveTemplate] = useState<'sales' | 'purchase'>(
    settings.defaultTemplate || 'sales',
  );
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const update = (patch: Partial<DocumentSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddBank = () => {
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      accountName: siteConfig.companyName || 'PRINCE CONSTRUCTION',
      bankName: 'STATE BANK OF INDIA',
      accountNumber: '400012345678',
      ifscCode: 'SBIN0001234',
      branch: 'MAIN BRANCH',
      isDefault: false,
    };
    update({ bankAccounts: [...settings.bankAccounts, newBank] });
  };

  const handleRemoveBank = (id: string) => {
    update({ bankAccounts: settings.bankAccounts.filter((b) => b.id !== id) });
  };

  const handleUpdateBank = (id: string, patch: Partial<BankAccount>) => {
    update({
      bankAccounts: settings.bankAccounts.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  return (
    <div className="settings-section-stack">
      {/* Top Action Toolbar */}
      <div className="settings-section-head">
        <div>
          <span className="settings-eyebrow">GST &amp; INVOICE ENGINE</span>
          <h2 className="settings-section-title">Documents &amp; PDF Invoices Customization</h2>
          <p className="settings-section-subtitle">
            Configure layout, tax breakdowns, e-Invoice QR codes, bank accounts, and print templates
            matching your real Purchase and Sales invoices.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={onReset}>
            <ArrowsClockwise size={16} />
            <span>Reset Defaults</span>
          </Button>
          <Button variant="outline" size="default" onClick={() => setPreviewModalOpen(true)}>
            <Eye size={16} />
            <span>Fullscreen Preview</span>
          </Button>
          <Button variant="outline" size="default" onClick={handlePrint} className="no-print">
            <Printer size={16} />
            <span>Print / PDF</span>
          </Button>
          <Button variant="default" size="default" onClick={onSave}>
            <FloppyDisk size={16} weight="bold" />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>

      {/* Template Switcher Tabs */}
      <div className="document-template-tabs">
        <button
          type="button"
          className={`doc-tab-btn ${activeTemplate === 'sales' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTemplate('sales');
            update({ defaultTemplate: 'sales' });
          }}
        >
          <Receipt size={18} weight="duotone" />
          <span>Sales & Contractor Running Bill (sales.pdf)</span>
          <small>UP Jal Nigam Client Invoice</small>
        </button>
        <button
          type="button"
          className={`doc-tab-btn ${activeTemplate === 'purchase' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTemplate('purchase');
            update({ defaultTemplate: 'purchase' });
          }}
        >
          <FilePdf size={18} weight="duotone" />
          <span>Material Procurement & PO Invoice (purchase.PDF)</span>
          <small>Birla / RCCPL e-Invoice Tax Invoice</small>
        </button>
      </div>

      <div className="settings-doc-split-view">
        {/* Left Column: Customization Controls */}
        <div className="settings-doc-controls">
          {/* Layout & Style Options */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Sliders size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="settings-card-title">Layout & Header Display</h3>
                <p className="settings-card-desc">Visual structure and dynamic sections</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="form-group-field">
                <label>Header Alignment Style</label>
                <div className="layout-options-grid">
                  {[
                    { id: 'split-qr', label: 'Split Header + QR Code' },
                    { id: 'left-aligned', label: 'Left Logo + Right Details' },
                    { id: 'centered', label: 'Centered Traditional Header' },
                  ].map((lo) => (
                    <button
                      key={lo.id}
                      type="button"
                      className={`layout-option-chip ${settings.headerLayout === lo.id ? 'is-selected' : ''}`}
                      onClick={() => update({ headerLayout: lo.id as any })}
                    >
                      <span>{lo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="watermarkText">Invoice Watermark / Header Status</label>
                <input
                  id="watermarkText"
                  type="text"
                  value={settings.watermarkText}
                  onChange={(e) => update({ watermarkText: e.target.value })}
                  className="settings-input"
                  placeholder="ORIGINAL FOR RECIPIENT"
                />
              </div>

              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.showEInvoiceQr}
                    onChange={(e) => update({ showEInvoiceQr: e.target.checked })}
                  />
                  <div>
                    <strong>e-Invoice IRN & Verification QR Code</strong>
                    <p>Prints GST e-Invoice IRN hash, Ack number, and digital QR code</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.showTransporterDetails}
                    onChange={(e) => update({ showTransporterDetails: e.target.checked })}
                  />
                  <div>
                    <strong>Transporter, Vehicle & E-Way Bill Section</strong>
                    <p>Prints Vehicle Reg No, LR/RR Date, Distance (KM), and E-Way Bill</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.showShipToAddress}
                    onChange={(e) => update({ showShipToAddress: e.target.checked })}
                  />
                  <div>
                    <strong>Separate Site Delivery Consignee (Ship To)</strong>
                    <p>Display destination site / school location different from billing party</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.showBankDetails}
                    onChange={(e) => update({ showBankDetails: e.target.checked })}
                  />
                  <div>
                    <strong>Bank Account & NEFT / RTGS Block</strong>
                    <p>Print bank name, account number, IFSC code, and branch in footer</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.showHsnCodes}
                    onChange={(e) => update({ showHsnCodes: e.target.checked })}
                  />
                  <div>
                    <strong>HSN / SAC Code Column</strong>
                    <p>Include Harmonized System commodity codes for materials</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.showTaxSplit}
                    onChange={(e) => update({ showTaxSplit: e.target.checked })}
                  />
                  <div>
                    <strong>CGST & SGST Split (Intrastate)</strong>
                    <p>Show CGST 9% + SGST 9% separate columns (or IGST 18% for interstate)</p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Bank Accounts for Invoice */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Bank size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <h3 className="settings-card-title">Remittance Bank Accounts</h3>
                <p className="settings-card-desc">Printed on client running bills and sales invoices</p>
              </div>
              <Button variant="outline" className="btn-sm" onClick={handleAddBank}>
                <Plus size={14} weight="bold" />
                <span>Add Bank</span>
              </Button>
            </div>

            <div className="settings-form-body">
              {settings.bankAccounts.map((b, idx) => (
                <div key={b.id} className="bank-account-item">
                  <div className="bank-item-head">
                    <span className="bank-item-badge">Account #{idx + 1}</span>
                    {settings.bankAccounts.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-bank"
                        onClick={() => handleRemoveBank(b.id)}
                        title="Remove bank"
                        aria-label="Remove bank"
                      >
                        <Trash size={15} />
                      </button>
                    )}
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group-field">
                      <label>Account Holder Name</label>
                      <input
                        type="text"
                        value={b.accountName}
                        onChange={(e) => handleUpdateBank(b.id, { accountName: e.target.value })}
                        className="settings-input"
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={b.bankName}
                        onChange={(e) => handleUpdateBank(b.id, { bankName: e.target.value })}
                        className="settings-input"
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={b.accountNumber}
                        onChange={(e) => handleUpdateBank(b.id, { accountNumber: e.target.value })}
                        className="settings-input font-mono"
                      />
                    </div>
                    <div className="form-group-field">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        value={b.ifscCode}
                        onChange={(e) =>
                          handleUpdateBank(b.id, { ifscCode: e.target.value.toUpperCase() })
                        }
                        className="settings-input font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Terms & Conditions Editor */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Receipt size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="settings-card-title">Terms & Conditions Presets</h3>
                <p className="settings-card-desc">Contractual clauses printed on document footer</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="form-group-field">
                <label>Sales & Running Bill Terms (E & O.E.)</label>
                <textarea
                  rows={4}
                  value={settings.salesTerms}
                  onChange={(e) => update({ salesTerms: e.target.value })}
                  className="settings-textarea font-mono text-xs"
                />
              </div>

              <div className="form-group-field">
                <label>Purchase Order & Procurement Terms</label>
                <textarea
                  rows={4}
                  value={settings.purchaseTerms}
                  onChange={(e) => update({ purchaseTerms: e.target.value })}
                  className="settings-textarea font-mono text-xs"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group-field">
                  <label htmlFor="signatoryName">Authorised Signatory Name</label>
                  <input
                    id="signatoryName"
                    type="text"
                    value={settings.signatoryName}
                    onChange={(e) => update({ signatoryName: e.target.value })}
                    className="settings-input"
                    placeholder="SHYAM BEHARI MAHESHWARI"
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="signatoryDesignation">Signatory Title</label>
                  <input
                    id="signatoryDesignation"
                    type="text"
                    value={settings.signatoryDesignation}
                    onChange={(e) => update({ signatoryDesignation: e.target.value })}
                    className="settings-input"
                    placeholder="Director / Authorized Signatory"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Interactive PDF Invoice Sheet Preview */}
        <div className="settings-doc-preview-pane">
          <div className="doc-preview-pane-head">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-blue-600" />
              <strong className="text-slate-800 text-sm font-semibold">
                Live Document Preview ({activeTemplate === 'sales' ? 'Tax Invoice - Sales' : 'Tax Invoice - Purchase'})
              </strong>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm no-print"
              onClick={handlePrint}
            >
              <Printer size={15} />
              <span>Print Preview</span>
            </button>
          </div>

          <div className="doc-sheet-viewport">
            {activeTemplate === 'sales' ? (
              <SalesInvoiceSheet settings={settings} />
            ) : (
              <PurchaseInvoiceSheet settings={settings} />
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <Modal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        title={`Invoice Preview · ${activeTemplate === 'sales' ? 'Prince Construction Sales Invoice' : 'Birla Material Purchase Tax Invoice'}`}
      >
        <div className="modal-invoice-preview-wrap">
          <div className="modal-preview-toolbar no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${activeTemplate === 'sales' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTemplate('sales')}
              >
                Sales Invoice (sales.pdf)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTemplate === 'purchase' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTemplate('purchase')}
              >
                Purchase Invoice (purchase.PDF)
              </button>
            </div>
            <Button variant="default" className="btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Document</span>
            </Button>
          </div>
          <div className="modal-sheet-scroll">
            {activeTemplate === 'sales' ? (
              <SalesInvoiceSheet settings={settings} />
            ) : (
              <PurchaseInvoiceSheet settings={settings} />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// SALES INVOICE SHEET (Authentic replica of docs/sales.pdf)
// ----------------------------------------------------------------------
function SalesInvoiceSheet({
  settings,
}: {
  settings: DocumentSettings;
}) {
  const bank = DUMMY_SALES_BANK;

  return (
    <div className="invoice-sheet sales-sheet-template print-sheet">
      {/* Header Banner */}
      <div className="invoice-header-box">
        <div className="invoice-header-branding">
          <img
            src="/icons/logo.jpeg"
            alt="Prince Constructions Logo"
            className="invoice-brand-logo"
          />
          <div>
            <h1 className="company-big-title">{siteConfig.companyName || 'PRINCE CONSTRUCTIONS'}</h1>
            <p className="company-tagline">Building Dreams • Creating Spaces</p>
          </div>
        </div>
        <p className="company-sub-line">
          Add- : {siteConfig.registeredAddress || 'SALLAHPUR, BHATANI, DEORIA'}
        </p>
        <p className="company-sub-line">
          Email ID:- {siteConfig.email || 'princeconstructionmust@gmail.com'}
        </p>
        <p className="company-sub-line font-bold">
          GSTIN No. {siteConfig.gstin || '09BKZPR3924E2ZH'}
        </p>
      </div>

      {/* Bill To & Metadata Grid */}
      <div className="invoice-meta-table-wrap">
        <table className="invoice-meta-table">
          <tbody>
            <tr>
              <td className="meta-lbl">Bill to :</td>
              <td className="meta-val font-semibold">
                PROJECT MANAGER<br />
                U-24C&amp;DS UP JAL NIGAM<br />
                Varanasi
              </td>
              <td className="meta-lbl">Invoice No.</td>
              <td className="meta-val font-bold text-center">14</td>
            </tr>
            <tr>
              <td className="meta-lbl">Add :-</td>
              <td className="meta-val">Varanasi, Uttar Pradesh</td>
              <td className="meta-lbl">Date :</td>
              <td className="meta-val text-center">27.08.2026</td>
            </tr>
            <tr>
              <td className="meta-lbl">GSTIN No.</td>
              <td className="meta-val font-mono">09AAALU0256C122</td>
              <td className="meta-lbl">State code</td>
              <td className="meta-val text-center">09</td>
            </tr>
            <tr>
              <td colSpan={2} className="meta-blank" />
              <td className="meta-lbl">SITE AT-</td>
              <td className="meta-val text-center font-semibold">samekit chandauli</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Line Items Table */}
      <div className="invoice-items-table-wrap">
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th style={{ width: 60 }} className="text-center">SL. No.</th>
              <th>DESCRIPTION</th>
              {settings.showHsnCodes && <th style={{ width: 100 }} className="text-center">HSN CODE</th>}
              <th style={{ width: 70 }} className="text-center">QTY</th>
              <th style={{ width: 70 }} className="text-center">UNIT</th>
              <th style={{ width: 120 }} className="text-right">PRICE</th>
              <th style={{ width: 130 }} className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">1</td>
              <td>
                <strong>Civil Work</strong>
                <small className="block text-slate-500">RCC foundation, column casting and site masonry</small>
              </td>
              {settings.showHsnCodes && <td className="text-center font-mono">995419</td>}
              <td className="text-center">1</td>
              <td className="text-center">job</td>
              <td className="text-right font-mono">3835147.00</td>
              <td className="text-right font-mono font-bold">3835147.00</td>
            </tr>
            {/* Blank filler rows to match real printed paper bill */}
            {[1, 2, 3].map((i) => (
              <tr key={i} className="filler-row">
                <td />
                <td />
                {settings.showHsnCodes && <td />}
                <td />
                <td />
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financials & Bank Details Grid */}
      <div className="invoice-footer-grid-wrap">
        <table className="invoice-footer-table">
          <tbody>
            <tr>
              <td className="bank-col-lbl">A/c Name :</td>
              <td className="bank-col-val font-semibold">{bank.accountName}</td>
              <td className="calc-col-lbl">Total Amount</td>
              <td className="calc-col-val font-mono font-bold">3,835,147.00</td>
            </tr>
            <tr>
              <td className="bank-col-lbl">Bank:</td>
              <td className="bank-col-val text-xs">{bank.bankName}</td>
              <td className="calc-col-lbl">AMOUNT BEF. TAX</td>
              <td className="calc-col-val font-mono font-bold">3,835,147.00</td>
            </tr>
            <tr>
              <td className="bank-col-lbl">A/C No.</td>
              <td className="bank-col-val font-mono font-bold">{bank.accountNumber}</td>
              <td className="calc-col-lbl">GST 18%</td>
              <td className="calc-col-val font-mono">690,326.00</td>
            </tr>
            <tr>
              <td className="bank-col-lbl">IFS Code :</td>
              <td className="bank-col-val font-mono font-bold">{bank.ifscCode}</td>
              <td className="calc-col-lbl font-bold">NET AMT. (Rs.)</td>
              <td className="calc-col-val font-mono font-bold text-base text-blue-900">4,525,473.00</td>
            </tr>
            <tr>
              <td className="bank-col-lbl">Branch :</td>
              <td className="bank-col-val">{bank.branch}</td>
              <td colSpan={2} className="text-right font-bold pr-4">
                {siteConfig.companyName || 'PRINCE CONSTRUCTION'}
              </td>
            </tr>
            <tr>
              <td className="bank-col-lbl">Amt. in Words</td>
              <td colSpan={3} className="words-val font-semibold italic">
                Forty Five Lakh Twenty Five Thousand Four Hundred Seventy Three Rupees Only
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms & Signature Footer */}
      <div className="invoice-terms-sign-wrap">
        <div className="terms-half">
          <div className="terms-head">E &amp; O.E</div>
          <ol className="terms-list">
            <li>Goods once sold and verified will not be returned.</li>
            <li>Responsibility ceases after delivery and site verification.</li>
          </ol>
        </div>
        <div className="sign-half">
          <div className="sign-box">
            <span className="sign-label">Authorised Signature</span>
            <div className="sign-line" />
            <strong className="sign-comp">{siteConfig.companyName || 'PRINCE CONSTRUCTION'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PURCHASE INVOICE SHEET (Authentic replica of docs/purchase.PDF)
// ----------------------------------------------------------------------
function PurchaseInvoiceSheet({
  settings,
  siteConfig,
}: {
  settings: DocumentSettings;
  siteConfig: SiteConfig;
}) {
  return (
    <div className="invoice-sheet purchase-sheet-template print-sheet">
      {/* Title & e-Invoice IRN Banner */}
      <div className="purchase-head-banner">
        <div className="purchase-brand-block">
          <div className="brand-logo-badge">
            <Buildings size={28} weight="duotone" />
            <span>MP BIRLA GROUP</span>
          </div>
          <div className="seller-address-block">
            <strong>RCCPL Private Limited</strong>
            <small className="block">(Subsidiary of Birla Corporation Limited)</small>
            <span>RCCPL- Kundanganj, Raebareilly - 229303</span>
            <span>Supply State: Uttar Pradesh · GSTIN: 09AADCR6967R1Z9</span>
            <span>TAN No: MUMR23337G</span>
          </div>
        </div>

        {/* e-Invoice Center QR Box */}
        {settings.showEInvoiceQr && (
          <div className="einvoice-qr-block">
            <div className="qr-box">
              <QrCode size={78} weight="bold" />
            </div>
            <div className="irn-details">
              <span className="irn-hash">
                IRN: 748653fcef8ec51b992b520d83ef691ab902e76ab553d1df3554493de38ef39b
              </span>
              <span>Ack.No- 142621495939269 · Ack.Date- 08.10.2026</span>
            </div>
          </div>
        )}

        {/* Document Meta Numbers */}
        <div className="purchase-meta-block">
          <h2 className="tax-inv-title">TAX INVOICE</h2>
          <span className="tax-inv-sub">ORIGINAL FOR RECIPIENT</span>
          <div className="meta-lines-stack">
            <div className="meta-line">
              <span>Invoice No:</span>
              <strong>1150533105</strong>
            </div>
            <div className="meta-line">
              <span>Invoice Dt:</span>
              <strong>08.10.2026</strong>
            </div>
            <div className="meta-line">
              <span>Delivery No:</span>
              <strong>2314513258</strong>
            </div>
            <div className="meta-line">
              <span>Delivery Date:</span>
              <strong>08.10.2026</strong>
            </div>
            <div className="meta-line">
              <span>Customer PO:</span>
              <strong>PO-2026-089</strong>
            </div>
            <div className="meta-line">
              <span>Place of Supply:</span>
              <strong>Intrastate (UP)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Parties Grid (Sold To Party & Ship To Party) */}
      <div className="parties-split-grid">
        <div className="party-card">
          <span className="party-tag">Sold To Party: 2042458 · Mob: 8888083403</span>
          <strong className="party-name">M/S PRINCE CONSTRUCTION</strong>
          <p className="party-addr">
            0, SHALLAHPUR, BHATNI, Deoria - 274501<br />
            State: Uttar Pradesh
          </p>
          <span className="party-gst font-mono">GSTIN: 09BKZPR3924E2ZH</span>
        </div>

        {settings.showShipToAddress && (
          <div className="party-card">
            <span className="party-tag">Ship to Party: 5056719 · Mob: 8888083403</span>
            <strong className="party-name">Samkit School Khasmau Khaga</strong>
            <p className="party-addr">
              Fatehpur, Fatehpur - 212622<br />
              Uttar Pradesh · WeekNo-41
            </p>
            <span className="party-gst font-mono">Site Code: SITE-FATEHPUR-02</span>
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="purchase-table-wrap">
        <table className="purchase-grid-table">
          <thead>
            <tr>
              <th>Description of Goods</th>
              <th className="text-center">HSN Code</th>
              <th className="text-center">Qty</th>
              <th className="text-center">UOM</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Particulars</th>
              <th className="text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>M P BIRLA CEMENT MULTICEM</strong>
                <small className="block text-slate-500">PPC Grade 53 Structural Cement</small>
              </td>
              <td className="text-center font-mono">25232930</td>
              <td className="text-center font-mono font-bold">37.000 (740)</td>
              <td className="text-center">MT / Bag</td>
              <td className="text-right font-mono">4,406.78</td>
              <td className="text-right text-xs">Basic Taxable</td>
              <td className="text-right font-mono font-bold">163,050.84</td>
            </tr>
            {settings.showTaxSplit && (
              <>
                <tr className="tax-subrow">
                  <td colSpan={5} className="text-right text-xs font-semibold">
                    CGST @ 9.00 %
                  </td>
                  <td className="text-right text-xs">Central Tax</td>
                  <td className="text-right font-mono font-semibold">14,674.58</td>
                </tr>
                <tr className="tax-subrow">
                  <td colSpan={5} className="text-right text-xs font-semibold">
                    SGST @ 9.00 %
                  </td>
                  <td className="text-right text-xs">State Tax</td>
                  <td className="text-right font-mono font-semibold">14,674.58</td>
                </tr>
              </>
            )}
            <tr className="total-highlight-row">
              <td colSpan={5} className="font-bold text-sm">
                Total Invoice Value (INR)
              </td>
              <td className="text-right font-bold">Invoice Total</td>
              <td className="text-right font-mono font-bold text-base text-blue-900">192,400.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in words */}
      <div className="purchase-words-strip">
        <strong>Invoice Amt (In words):</strong>
        <span className="italic">ONE LAKH NINETY TWO THOUSAND FOUR HUNDRED Rupees</span>
      </div>

      {/* Transport & Logistics Section */}
      {settings.showTransporterDetails && (
        <div className="transport-grid-box">
          <div className="trans-cell">
            <span>Mode of Transport:</span> <strong>ROAD</strong>
          </div>
          <div className="trans-cell">
            <span>Transporter:</span> <strong>SHIV RAJDHANI TRANSPORT</strong>
          </div>
          <div className="trans-cell">
            <span>Vehicle Reg.No:</span> <strong className="font-mono">UP33CT5608</strong>
          </div>
          <div className="trans-cell">
            <span>E-Way Bill No:</span> <strong className="font-mono">491782010310</strong>
          </div>
          <div className="trans-cell">
            <span>LR/RR No:</span> <strong>1081</strong>
          </div>
          <div className="trans-cell">
            <span>Distance (KM):</span> <strong>126.000 KM</strong>
          </div>
        </div>
      )}

      {/* Terms and Signatures */}
      <div className="purchase-footer-split">
        <div className="purchase-terms-col">
          <strong>Terms &amp; Conditions</strong>
          <pre className="terms-pre-text">{settings.purchaseTerms}</pre>
        </div>
        <div className="purchase-sign-col">
          <div className="verified-condition-box">
            <span>Material received in Good Condition &amp; in Quantity</span>
            <div className="recv-line">(Receiver Signature with seal)</div>
          </div>
          <div className="auth-sign-box">
            <span>For RCCPL Private Limited</span>
            <small>(Subsidiary of Birla Corporation Limited)</small>
            <div className="digital-sign-stamp">
              <CheckCircle size={16} weight="fill" className="text-emerald-600" />
              <span>Digitally Signed by:</span>
              <strong>{settings.signatoryName || 'SHYAM BEHARI MAHESHWARI'}</strong>
              <small>{new Date().toLocaleDateString('en-IN')} 04:01:35 IST</small>
            </div>
            <strong className="auth-lbl">(Authorised Signatory)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
