export interface SiteConfig {
  companyName: string;
  brandTagline: string;
  logoPreset: string;
  customLogoUrl: string;
  primaryColor: string;
  themeMode: 'light' | 'dark' | 'system';
  fontFamily: string;
  tableDensity: 'comfortable' | 'compact';
  // Legal profile
  legalName: string;
  gstin: string;
  pan: string;
  tan: string;
  cin: string;
  state: string;
  stateCode: string;
  registeredAddress: string;
  corporateAddress: string;
  email: string;
  phone: string;
  website: string;
  // Regional
  currencySymbol: string;
  numberFormat: 'indian' | 'international';
  dateFormat: string;
  financialYearStart: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  isDefault: boolean;
}

export interface DocumentSettings {
  defaultTemplate: 'purchase' | 'sales';
  headerLayout: 'split-qr' | 'left-aligned' | 'centered';
  accentColor: string;
  showEInvoiceQr: boolean;
  showTransporterDetails: boolean;
  showShipToAddress: boolean;
  showBankDetails: boolean;
  showHsnCodes: boolean;
  showTaxSplit: boolean; // CGST+SGST vs single GST
  showSignatures: boolean;
  showAmountInWords: boolean;
  watermarkText: string;
  signatoryName: string;
  signatoryDesignation: string;
  purchaseTerms: string;
  salesTerms: string;
  bankAccounts: BankAccount[];
}

export interface WorkflowTier {
  id: string;
  name: string;
  role: string;
  maxAmount: number;
  description: string;
}

export interface WorkflowSettings {
  autoApproveBelow: number;
  requireMeasurementSheetForBills: boolean;
  requireWeighbridgeSlipForGrn: boolean;
  requirePoForGrn: boolean;
  slaTurnaroundDays: number;
  tiers: WorkflowTier[];
}

export interface SequenceConfig {
  id: string;
  documentName: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextNumber: number;
  sample: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  whatsappAlerts: boolean;
  inAppAlerts: boolean;
  notifyOnMaterialRequestSubmit: boolean;
  notifyOnBillApprovalRequired: boolean;
  notifyOnLowStockAlert: boolean;
  notifyOnDailySiteLogReminder: boolean;
  digestFrequency: 'instant' | 'daily' | 'weekly';
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  companyName: 'PRINCE CONSTRUCTION',
  brandTagline: 'Civil Engineering, EPC & Infrastructure Development',
  logoPreset: 'monogram',
  customLogoUrl: '',
  primaryColor: '#0b1f42',
  themeMode: 'light',
  fontFamily: 'Inter',
  tableDensity: 'comfortable',
  legalName: 'Prince Construction Private Limited',
  gstin: '09BKZPR3924E2ZH',
  pan: 'BKZPR3924E',
  tan: 'MUMR23337G',
  cin: 'U26940WB2007PTC271147',
  state: 'Uttar Pradesh',
  stateCode: '09',
  registeredAddress: '0, SHALLAHPUR, BHATNI, Deoria - 274501, Uttar Pradesh',
  corporateAddress: 'Samkit School Khasmau Khaga, Fatehpur - 212622, Uttar Pradesh',
  email: 'princeconstructionmust@gmail.com',
  phone: '+91 88880 83403',
  website: 'https://princeconstruction.example',
  currencySymbol: '₹',
  numberFormat: 'indian',
  dateFormat: 'DD MMM YYYY',
  financialYearStart: 'April',
};

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  defaultTemplate: 'sales',
  headerLayout: 'split-qr',
  accentColor: '#0b1f42',
  showEInvoiceQr: true,
  showTransporterDetails: true,
  showShipToAddress: true,
  showBankDetails: true,
  showHsnCodes: true,
  showTaxSplit: true,
  showSignatures: true,
  showAmountInWords: true,
  watermarkText: 'ORIGINAL FOR RECIPIENT',
  signatoryName: 'SHYAM BEHARI MAHESHWARI',
  signatoryDesignation: 'Authorised Signatory / Director',
  purchaseTerms: `1. Price as applicable on the date of dispatch shall be charged.
2. Payment should be made by "A/C Payee only" bank draft/cheque or bank remittance by NEFT/RTGS in favour of RCCPL Private Limited.
3. Payment to be made immediate from date of supply. Interest @ 24% p.a. shall be charged if payment is not received within 30 days.
4. Delivery of goods shall be completed as soon as goods are delivered to carrier; title & all risk stands transferred to buyer immediately.
5. All disputes are subject to Kolkata jurisdiction only.`,
  salesTerms: `1. E & O.E. (Errors and Omissions Excepted).
2. Goods once sold and certified on site will not be returned.
3. Responsibility ceases after delivery and supervisor site sign-off.
4. Payment due within 15 days from submission of certified running bill.
5. Subject to local jurisdiction of Deoria / Lucknow.`,
  bankAccounts: [
    {
      id: 'bank-1',
      accountName: 'PRINCE CONSTRUCTION',
      bankName: 'IDBI BANK, MANOJ PANDEY CHAURAHA, GOMTINAGAR LKO',
      accountNumber: '0314653800000408',
      ifscCode: 'IBKL0000314',
      branch: 'LUCKNOW',
      isDefault: true,
    },
    {
      id: 'bank-2',
      accountName: 'PRINCE CONSTRUCTION (ESCROW)',
      bankName: 'HDFC BANK, HAZRATGANJ BRANCH',
      accountNumber: '50200048192311',
      ifscCode: 'HDFC0000084',
      branch: 'HAZRATGANJ, LUCKNOW',
      isDefault: false,
    },
  ],
};

export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettings = {
  autoApproveBelow: 50000,
  requireMeasurementSheetForBills: true,
  requireWeighbridgeSlipForGrn: true,
  requirePoForGrn: true,
  slaTurnaroundDays: 3,
  tiers: [
    {
      id: 'tier-1',
      name: 'Billing Engineer (Tier 1)',
      role: 'Billing Engineer',
      maxAmount: 500000,
      description: 'MB physical audit & rate verification against work order',
    },
    {
      id: 'tier-2',
      name: 'Project Manager (Tier 2)',
      role: 'Project Manager',
      maxAmount: 2500000,
      description: 'Cost code budget check & milestone progress signoff',
    },
    {
      id: 'tier-3',
      name: 'Director / Owner (Tier 3)',
      role: 'Owner / Director',
      maxAmount: 100000000,
      description: 'High value release, executive signoff & bank advice sanction',
    },
  ],
};

export const DEFAULT_SEQUENCE_CONFIGS: SequenceConfig[] = [
  {
    id: 'seq-po',
    documentName: 'Purchase Orders',
    prefix: 'PO-26-',
    suffix: '',
    padding: 4,
    nextNumber: 120,
    sample: 'PO-26-0120',
  },
  {
    id: 'seq-mr',
    documentName: 'Material Requests',
    prefix: 'MR-26-',
    suffix: '',
    padding: 4,
    nextNumber: 119,
    sample: 'MR-26-0119',
  },
  {
    id: 'seq-rb',
    documentName: 'Contractor Running Bills',
    prefix: 'RB-',
    suffix: '',
    padding: 3,
    nextNumber: 5,
    sample: 'RB-005',
  },
  {
    id: 'seq-inv',
    documentName: 'Tax / Sales Invoices',
    prefix: 'INV-26-',
    suffix: '',
    padding: 5,
    nextNumber: 15,
    sample: 'INV-26-00015',
  },
  {
    id: 'seq-grn',
    documentName: 'Goods Receipt Notes',
    prefix: 'GRN-26-',
    suffix: '',
    padding: 4,
    nextNumber: 88,
    sample: 'GRN-26-0088',
  },
  {
    id: 'seq-mb',
    documentName: 'Measurement Book Entries',
    prefix: 'MB-26-',
    suffix: '',
    padding: 4,
    nextNumber: 312,
    sample: 'MB-26-0312',
  },
];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailAlerts: true,
  smsAlerts: true,
  whatsappAlerts: true,
  inAppAlerts: true,
  notifyOnMaterialRequestSubmit: true,
  notifyOnBillApprovalRequired: true,
  notifyOnLowStockAlert: true,
  notifyOnDailySiteLogReminder: true,
  digestFrequency: 'instant',
};

export interface GstRegistration {
  id: string;
  state: string;
  stateCode: string;
  gstin: string;
  isPrimary: boolean;
  address: string;
}

export interface TaxSlab {
  id: string;
  category: string;
  hsnSac: string;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  description: string;
}

export interface TdsRule {
  id: string;
  section: string;
  description: string;
  rateIndividual: number;
  rateCompany: number;
  threshold: number;
}

export interface GstSettings {
  primaryGstin: string;
  legalTradeName: string;
  stateOfRegistration: string;
  stateCode: string;
  filingFrequency: 'monthly' | 'quarterly_qrmp';
  taxpayerType: 'regular' | 'composition' | 'sez_unit';
  eInvoicingEnabled: boolean;
  eInvoiceTurnoverThreshold: number;
  eWayBillEnabled: boolean;
  intraStateEwayThreshold: number;
  interStateEwayThreshold: number;
  nicApiUsername: string;
  nicGspProvider: 'cleartax' | 'reliance_jio' | 'cygnet' | 'custom_direct';
  autoGenerateVehicleSlip: boolean;
  slabs: TaxSlab[];
  tdsOnGstEnabled: boolean;
  tdsOnGstThreshold: number;
  tdsRules: TdsRule[];
  rcmGtaRate: number;
  rcmUnregisteredContractorEnabled: boolean;
  rcmLegalServicesRate: number;
  rcmSecurityServicesRate: number;
  autoBlockImmovablePropertyItc: boolean;
  gstr2bMatchTolerance: number;
  allowProvisionalItcWithout2B: boolean;
  registrations: GstRegistration[];
}

export const DEFAULT_GST_SETTINGS: GstSettings = {
  primaryGstin: '09BKZPR3924E2ZH',
  legalTradeName: 'Prince Construction Private Limited',
  stateOfRegistration: 'Uttar Pradesh',
  stateCode: '09',
  filingFrequency: 'monthly',
  taxpayerType: 'regular',
  eInvoicingEnabled: true,
  eInvoiceTurnoverThreshold: 50000000,
  eWayBillEnabled: true,
  intraStateEwayThreshold: 100000,
  interStateEwayThreshold: 50000,
  nicApiUsername: 'PRINCE_NIC_09',
  nicGspProvider: 'cleartax',
  autoGenerateVehicleSlip: true,
  slabs: [
    {
      id: 'slab-works-govt',
      category: 'Works Contract (Govt / Affordable Housing)',
      hsnSac: '9954',
      rate: 12,
      cgst: 6,
      sgst: 6,
      igst: 12,
      description: 'Composite supply of civil works contract for Govt or affordable housing',
    },
    {
      id: 'slab-works-comm',
      category: 'Works Contract (Commercial / Industrial)',
      hsnSac: '9954',
      rate: 18,
      cgst: 9,
      sgst: 9,
      igst: 18,
      description: 'Standard civil construction, commercial buildings & EPC projects',
    },
    {
      id: 'slab-cement',
      category: 'Cement (OPC / PPC / White)',
      hsnSac: '2523',
      rate: 28,
      cgst: 14,
      sgst: 14,
      igst: 28,
      description: 'Portland cement, aluminous cement & slag cement',
    },
    {
      id: 'slab-steel',
      category: 'TMT Steel & Structural Bars',
      hsnSac: '7214',
      rate: 18,
      cgst: 9,
      sgst: 9,
      igst: 18,
      description: 'Thermo-Mechanically Treated (TMT) steel bars, angles & channels',
    },
    {
      id: 'slab-aggregates',
      category: 'Sand, Stone Aggregates & Gravel',
      hsnSac: '2517',
      rate: 5,
      cgst: 2.5,
      sgst: 2.5,
      igst: 5,
      description: 'River sand, M-sand, crushed stone aggregate 10mm/20mm/40mm',
    },
    {
      id: 'slab-bricks',
      category: 'Fly Ash & Clay Bricks',
      hsnSac: '6815',
      rate: 5,
      cgst: 2.5,
      sgst: 2.5,
      igst: 5,
      description: 'Fly ash bricks, AAC blocks, building blocks',
    },
    {
      id: 'slab-equipment',
      category: 'Heavy Earthmoving Equipment Rental',
      hsnSac: '9973',
      rate: 18,
      cgst: 9,
      sgst: 9,
      igst: 18,
      description: 'Excavator, JCB, transit mixer, crane hire with operator',
    },
  ],
  tdsOnGstEnabled: true,
  tdsOnGstThreshold: 250000,
  tdsRules: [
    {
      id: 'tds-194c',
      section: 'Sec 194C',
      description: 'Payment to Contractors & Sub-contractors for Civil Works',
      rateIndividual: 1,
      rateCompany: 2,
      threshold: 30000,
    },
    {
      id: 'tds-194j',
      section: 'Sec 194J',
      description: 'Fees for Professional / Structural / Architectural Services',
      rateIndividual: 10,
      rateCompany: 10,
      threshold: 30000,
    },
    {
      id: 'tds-194q',
      section: 'Sec 194Q',
      description: 'TDS on Purchase of Goods / Raw Materials exceeding 50 Lakhs',
      rateIndividual: 0.1,
      rateCompany: 0.1,
      threshold: 5000000,
    },
    {
      id: 'tds-sec51',
      section: 'Sec 51 (GST)',
      description: 'TDS under GST by Government Entities & PSUs',
      rateIndividual: 2,
      rateCompany: 2,
      threshold: 250000,
    },
  ],
  rcmGtaRate: 5,
  rcmUnregisteredContractorEnabled: true,
  rcmLegalServicesRate: 18,
  rcmSecurityServicesRate: 18,
  autoBlockImmovablePropertyItc: true,
  gstr2bMatchTolerance: 10,
  allowProvisionalItcWithout2B: false,
  registrations: [
    {
      id: 'reg-up',
      state: 'Uttar Pradesh',
      stateCode: '09',
      gstin: '09BKZPR3924E2ZH',
      isPrimary: true,
      address: '0, SHALLAHPUR, BHATNI, Deoria - 274501, Uttar Pradesh',
    },
    {
      id: 'reg-bihar',
      state: 'Bihar',
      stateCode: '10',
      gstin: '10BKZPR3924E1Z5',
      isPrimary: false,
      address: 'Near Gandhi Maidan, Exhibition Road, Patna - 800001, Bihar',
    },
    {
      id: 'reg-delhi',
      state: 'Delhi (NCR)',
      stateCode: '07',
      gstin: '07BKZPR3924E1ZU',
      isPrimary: false,
      address: 'Barakhamba Road, Connaught Place, New Delhi - 110001',
    },
  ],
};
