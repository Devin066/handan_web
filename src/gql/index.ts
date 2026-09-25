import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AccountBalance = {
  __typename?: 'AccountBalance';
  account?: Maybe<Scalars['String']['output']>;
  /** Debits minus credits. */
  balance?: Maybe<Scalars['Decimal']['output']>;
  credit?: Maybe<Scalars['Decimal']['output']>;
  debit?: Maybe<Scalars['Decimal']['output']>;
};

export type AttendanceRecord = {
  __typename?: 'AttendanceRecord';
  notes?: Maybe<Scalars['String']['output']>;
  overtimeHours?: Maybe<Scalars['Decimal']['output']>;
  regularHours?: Maybe<Scalars['Decimal']['output']>;
  staffName?: Maybe<Scalars['String']['output']>;
  staffUuid?: Maybe<Scalars['ID']['output']>;
  /** present, late, absent or on_leave. */
  status?: Maybe<Scalars['String']['output']>;
  timeIn?: Maybe<Scalars['DateTime']['output']>;
  timeOut?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  workDate?: Maybe<Scalars['DateTime']['output']>;
};

export type Benefits = {
  __typename?: 'Benefits';
  defaultPieceRate?: Maybe<Scalars['Float']['output']>;
  overtimeMultiplier?: Maybe<Scalars['Float']['output']>;
  pagibigRate?: Maybe<Scalars['Float']['output']>;
  philhealthRate?: Maybe<Scalars['Float']['output']>;
  sssRate?: Maybe<Scalars['Float']['output']>;
  standardHoursPerDay?: Maybe<Scalars['Float']['output']>;
  withholdingTaxRate?: Maybe<Scalars['Float']['output']>;
};

export type BenefitsRequest = {
  defaultPieceRate?: InputMaybe<Scalars['Float']['input']>;
  overtimeMultiplier?: InputMaybe<Scalars['Float']['input']>;
  pagibigRate?: InputMaybe<Scalars['Float']['input']>;
  philhealthRate?: InputMaybe<Scalars['Float']['input']>;
  sssRate?: InputMaybe<Scalars['Float']['input']>;
  standardHoursPerDay?: InputMaybe<Scalars['Float']['input']>;
  withholdingTaxRate?: InputMaybe<Scalars['Float']['input']>;
};

export type Bom = {
  __typename?: 'Bom';
  bomItems?: Maybe<Array<Maybe<BomItem>>>;
  bomProcesses?: Maybe<Array<Maybe<BomProcess>>>;
  code?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  itemName?: Maybe<Scalars['String']['output']>;
  /** The assembly flattened by level; level 0 is the finished part. */
  levels?: Maybe<Array<Maybe<BomLevel>>>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type BomItem = {
  __typename?: 'BomItem';
  bom?: Maybe<Bom>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  itemName?: Maybe<Scalars['String']['output']>;
  qty?: Maybe<Scalars['Decimal']['output']>;
  stockUom?: Maybe<StockUom>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type BomItemArg = {
  itemUuid?: InputMaybe<Scalars['ID']['input']>;
  qty?: InputMaybe<Scalars['Decimal']['input']>;
};

export type BomLevel = {
  __typename?: 'BomLevel';
  bomCode?: Maybe<Scalars['String']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemType?: Maybe<Scalars['String']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  qty?: Maybe<Scalars['Decimal']['output']>;
};

export type BomProcess = {
  __typename?: 'BomProcess';
  bom?: Maybe<Bom>;
  position?: Maybe<Scalars['Int']['output']>;
  process?: Maybe<Process>;
  processName?: Maybe<Scalars['String']['output']>;
  toolRequired?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type BomProcessArg = {
  position?: InputMaybe<Scalars['Int']['input']>;
  processUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type ChangePasswordRequest = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type Company = {
  __typename?: 'Company';
  description?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

/** the root of query. */
export type Configuration = {
  __typename?: 'Configuration';
  currency?: Maybe<Scalars['String']['output']>;
  decimalPlaces?: Maybe<Scalars['Int']['output']>;
  /** manager: a manager assigns production tasks. self: workers claim them. */
  productionClaimMode?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
};

export type CreateBomRequest = {
  bomItems?: InputMaybe<Array<InputMaybe<BomItemArg>>>;
  bomProcesses?: InputMaybe<Array<InputMaybe<BomProcessArg>>>;
  itemUuid?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCustomerRequest = {
  address?: InputMaybe<Scalars['String']['input']>;
  alternatePhone?: InputMaybe<Scalars['String']['input']>;
  barangay?: InputMaybe<Scalars['String']['input']>;
  buildSpecs?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  customerType?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  facebook?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  landline?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  marketplaceAccount?: InputMaybe<Scalars['String']['input']>;
  messengerId?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** Optional: derived from the name parts when omitted. */
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  primaryChannel?: InputMaybe<Scalars['String']['input']>;
  province?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  sourcePlatform?: InputMaybe<Scalars['String']['input']>;
  suffix?: InputMaybe<Scalars['String']['input']>;
  telegram?: InputMaybe<Scalars['String']['input']>;
  tiktok?: InputMaybe<Scalars['String']['input']>;
  viber?: InputMaybe<Scalars['String']['input']>;
  whatsapp?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDeliveryNoteRequest = {
  deliveryItems?: InputMaybe<Array<InputMaybe<DeliveryNoteItemArg>>>;
  salesOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateItemRequest = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  itemType?: InputMaybe<Scalars['String']['input']>;
  minStockThreshold?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  openingStocks?: InputMaybe<Array<InputMaybe<OpeningStockArg>>>;
  sellingPrice: Scalars['Decimal']['input'];
  sku?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['String']['input']>;
  standardCost?: InputMaybe<Scalars['Float']['input']>;
  stockUoms: Array<InputMaybe<StockUomArg>>;
};

export type CreatePaymentEntryRequest = {
  attachments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  paidOn?: InputMaybe<Scalars['DateTime']['input']>;
  partyType: Scalars['String']['input'];
  partyUuid: Scalars['ID']['input'];
  paymentMethodUuid: Scalars['ID']['input'];
  purchaseInvoiceIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  referenceNo?: InputMaybe<Scalars['String']['input']>;
  salesInvoiceIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  totalAmount?: InputMaybe<Scalars['Float']['input']>;
  type: Scalars['String']['input'];
};

export type CreatePaymentMethodRequest = {
  accountName?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  requiresReference?: InputMaybe<Scalars['Boolean']['input']>;
  uuid?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateProcessRequest = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePurchaseInvoiceRequest = {
  amount?: InputMaybe<Scalars['Decimal']['input']>;
  purchaseOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type CreatePurchaseOrderRequest = {
  expectedDate?: InputMaybe<Scalars['DateTime']['input']>;
  purchaseItems?: InputMaybe<Array<InputMaybe<PurchaseOrderItemArg>>>;
  supplierUuid?: InputMaybe<Scalars['ID']['input']>;
  warehouseUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type CreatePurchaseRequestRequest = {
  items?: InputMaybe<Array<InputMaybe<PurchaseRequestItemArg>>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  requestedBy?: InputMaybe<Scalars['String']['input']>;
  requiredDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateReceiptNoteRequest = {
  purchaseOrderUuid?: InputMaybe<Scalars['ID']['input']>;
  receiptItems?: InputMaybe<Array<InputMaybe<ReceiptNoteItemArg>>>;
};

export type CreateSalesInvoiceRequest = {
  /** Legacy: bill the whole order at this amount. Ignored when items are given. */
  amount?: InputMaybe<Scalars['Decimal']['input']>;
  customerAddress?: InputMaybe<Scalars['String']['input']>;
  customerReference?: InputMaybe<Scalars['String']['input']>;
  customerTin?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  invoiceDate?: InputMaybe<Scalars['DateTime']['input']>;
  items?: InputMaybe<Array<InputMaybe<SalesInvoiceItemArg>>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentTerms?: InputMaybe<Scalars['String']['input']>;
  salesOrderUuid?: InputMaybe<Scalars['ID']['input']>;
  vatMode?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSalesOrderRequest = {
  customerAddress?: InputMaybe<Scalars['String']['input']>;
  customerUuid?: InputMaybe<Scalars['ID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  requiredDate?: InputMaybe<Scalars['DateTime']['input']>;
  salesItems?: InputMaybe<Array<InputMaybe<SalesOrderItemArg>>>;
  warehouseUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateSupplierRequest = {
  address: Scalars['String']['input'];
  contactFirstName: Scalars['String']['input'];
  contactLastName: Scalars['String']['input'];
  contactPosition?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  landline?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  tin?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWorkOrderRequest = {
  assignedStaffUuid?: InputMaybe<Scalars['ID']['input']>;
  bomUuid?: InputMaybe<Scalars['ID']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  pieceRate?: InputMaybe<Scalars['Float']['input']>;
  plannedQty?: InputMaybe<Scalars['Decimal']['input']>;
  salesOrderUuid?: InputMaybe<Scalars['ID']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
  warehouseUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateWorkstationRequest = {
  capacityHours?: InputMaybe<Scalars['Float']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['ID']['input']>;
};

export type Customer = {
  __typename?: 'Customer';
  address?: Maybe<Scalars['String']['output']>;
  alternatePhone?: Maybe<Scalars['String']['output']>;
  balance?: Maybe<Scalars['Decimal']['output']>;
  barangay?: Maybe<Scalars['String']['output']>;
  /** Standing build specifications: bike model, finish, fitment. */
  buildSpecs?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  companyName?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  customerType?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  facebook?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  followUpStatus?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  landline?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  marketplaceAccount?: Maybe<Scalars['String']['output']>;
  messengerId?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  primaryChannel?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  sourcePlatform?: Maybe<Scalars['String']['output']>;
  suffix?: Maybe<Scalars['String']['output']>;
  telegram?: Maybe<Scalars['String']['output']>;
  tiktok?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  viber?: Maybe<Scalars['String']['output']>;
  whatsapp?: Maybe<Scalars['String']['output']>;
};

export type DateRequest = {
  date?: InputMaybe<Scalars['String']['input']>;
};

export type DeliveryNote = {
  __typename?: 'DeliveryNote';
  code?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  customerName?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  items?: Maybe<Array<Maybe<DeliveryNoteItem>>>;
  salesOrder?: Maybe<SalesOrder>;
  salesOrderUuid?: Maybe<Scalars['ID']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  totalAmount?: Maybe<Scalars['Decimal']['output']>;
  totalQty?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
};

export type DeliveryNoteItem = {
  __typename?: 'DeliveryNoteItem';
  actualQty?: Maybe<Scalars['Decimal']['output']>;
  amount?: Maybe<Scalars['Decimal']['output']>;
  deliveryNote?: Maybe<DeliveryNote>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  itemName?: Maybe<Scalars['String']['output']>;
  salesOrder?: Maybe<SalesOrder>;
  salesOrderItem?: Maybe<SalesOrderItem>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  unitPrice?: Maybe<Scalars['Decimal']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type DeliveryNoteItemArg = {
  actualQty?: InputMaybe<Scalars['Decimal']['input']>;
  salesOrderItemUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type DeliveryNoteRequest = {
  deliveryNoteUuid?: InputMaybe<Scalars['ID']['input']>;
  salesOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type GeneratePayrollRequest = {
  endDate: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  payDate?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['ID']['input']>;
};

export type IdRequest = {
  uuid?: InputMaybe<Scalars['ID']['input']>;
};

export type InventoryEntry = {
  __typename?: 'InventoryEntry';
  actualQty?: Maybe<Scalars['Decimal']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  qtyAfterTransaction?: Maybe<Scalars['Decimal']['output']>;
  stockUom?: Maybe<StockUom>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  threadType?: Maybe<Scalars['String']['output']>;
  threadUuid?: Maybe<Scalars['ID']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
};

export type InvoiceRef = {
  __typename?: 'InvoiceRef';
  code?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type Item = {
  __typename?: 'Item';
  /** onHandQty minus reservedQty. */
  availableQty?: Maybe<Scalars['Decimal']['output']>;
  bom?: Maybe<Bom>;
  category?: Maybe<Scalars['String']['output']>;
  defaultStockUomName?: Maybe<Scalars['String']['output']>;
  defaultStockUomUuid?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  /** raw_material (RM), manufactured_part (MP) or finished_good (FG). */
  itemType?: Maybe<Scalars['String']['output']>;
  minStockThreshold?: Maybe<Scalars['Decimal']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** Across all warehouses, in the default stock UOM. */
  onHandQty?: Maybe<Scalars['Decimal']['output']>;
  /** Committed to open orders, in the default stock UOM. */
  reservedQty?: Maybe<Scalars['Decimal']['output']>;
  sellingPrice?: Maybe<Scalars['Decimal']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  spec?: Maybe<Scalars['String']['output']>;
  standardCost?: Maybe<Scalars['Decimal']['output']>;
  stockItems?: Maybe<Array<Maybe<StockItem>>>;
  stockUoms?: Maybe<Array<Maybe<StockUom>>>;
  /** onHandQty valued at standardCost. */
  stockValue?: Maybe<Scalars['Decimal']['output']>;
  supplierPrices?: Maybe<Array<Maybe<SupplierPrice>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type JobCard = {
  __typename?: 'JobCard';
  defectiveQty?: Maybe<Scalars['Decimal']['output']>;
  endTime?: Maybe<Scalars['DateTime']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  laborHours?: Maybe<Scalars['Float']['output']>;
  machineHours?: Maybe<Scalars['Decimal']['output']>;
  operatorStaff?: Maybe<Staff>;
  operatorStaffUuid?: Maybe<Scalars['ID']['output']>;
  producedQty?: Maybe<Scalars['Decimal']['output']>;
  startTime?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  workOrder?: Maybe<WorkOrder>;
  workOrderItem?: Maybe<WorkOrderItem>;
  workOrderItemUuid?: Maybe<Scalars['ID']['output']>;
  workOrderUuid?: Maybe<Scalars['ID']['output']>;
};

export type JournalEntry = {
  __typename?: 'JournalEntry';
  description?: Maybe<Scalars['String']['output']>;
  entryDate?: Maybe<Scalars['DateTime']['output']>;
  lines?: Maybe<Array<Maybe<JournalLine>>>;
  sourceCode?: Maybe<Scalars['String']['output']>;
  sourceType?: Maybe<Scalars['String']['output']>;
  sourceUuid?: Maybe<Scalars['ID']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type JournalLine = {
  __typename?: 'JournalLine';
  account?: Maybe<Scalars['String']['output']>;
  credit?: Maybe<Scalars['Decimal']['output']>;
  debit?: Maybe<Scalars['Decimal']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type LoginRequest = {
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type LowStockLevelRequest = {
  itemUuid: Scalars['ID']['input'];
  minStockThreshold: Scalars['Float']['input'];
};

export type ManufacturedGood = {
  __typename?: 'ManufacturedGood';
  itemName?: Maybe<Scalars['String']['output']>;
  qty?: Maybe<Scalars['Decimal']['output']>;
  storedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  workOrderCode?: Maybe<Scalars['String']['output']>;
};

/** Turn a member's login on or off. A new login needs a password; an existing one keeps its password unless one is sent. */
export type MemberLoginRequest = {
  enabled: Scalars['Boolean']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  staffUuid: Scalars['ID']['input'];
};

export type ModuleOption = {
  __typename?: 'ModuleOption';
  key?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
};

export type MoveWorkOrderStageRequest = {
  /** Pieces that passed, when passing quality check. */
  goodQty?: InputMaybe<Scalars['Float']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  /** Pieces made, when sending to quality check. */
  reportedQty?: InputMaybe<Scalars['Float']['input']>;
  /** Who the task goes to, when assigning or claiming. */
  staffUuid?: InputMaybe<Scalars['ID']['input']>;
  toStage: Scalars['String']['input'];
  uuid: Scalars['ID']['input'];
};

/** name is only accepted from roles with Settings access. */
export type MyProfileRequest = {
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type OpeningStockArg = {
  qty?: InputMaybe<Scalars['Float']['input']>;
  warehouseUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type PaymentEntry = {
  __typename?: 'PaymentEntry';
  attachments?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  code?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  memo?: Maybe<Scalars['String']['output']>;
  paidOn?: Maybe<Scalars['DateTime']['output']>;
  partyName?: Maybe<Scalars['String']['output']>;
  partyType?: Maybe<Scalars['String']['output']>;
  partyUuid?: Maybe<Scalars['ID']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentMethodUuid?: Maybe<Scalars['ID']['output']>;
  purchaseInvoiceIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  referenceNo?: Maybe<Scalars['String']['output']>;
  salesInvoiceIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  totalAmount?: Maybe<Scalars['Decimal']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  accountName?: Maybe<Scalars['String']['output']>;
  accountNumber?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  requiresReference?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type PayrollEntry = {
  __typename?: 'PayrollEntry';
  basePay?: Maybe<Scalars['Decimal']['output']>;
  daysPresent?: Maybe<Scalars['Int']['output']>;
  employmentType?: Maybe<Scalars['String']['output']>;
  grossPay?: Maybe<Scalars['Decimal']['output']>;
  hourlyRate?: Maybe<Scalars['Decimal']['output']>;
  incentivePay?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  netPay?: Maybe<Scalars['Decimal']['output']>;
  overtimeHours?: Maybe<Scalars['Decimal']['output']>;
  overtimePay?: Maybe<Scalars['Decimal']['output']>;
  pagibigDeduction?: Maybe<Scalars['Decimal']['output']>;
  periodName?: Maybe<Scalars['String']['output']>;
  philhealthDeduction?: Maybe<Scalars['Decimal']['output']>;
  regularHours?: Maybe<Scalars['Decimal']['output']>;
  sssDeduction?: Maybe<Scalars['Decimal']['output']>;
  staffName?: Maybe<Scalars['String']['output']>;
  staffUuid?: Maybe<Scalars['ID']['output']>;
  taxDeduction?: Maybe<Scalars['Decimal']['output']>;
  unitsProduced?: Maybe<Scalars['Decimal']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type PayrollPeriod = {
  __typename?: 'PayrollPeriod';
  endDate?: Maybe<Scalars['DateTime']['output']>;
  entries?: Maybe<Array<Maybe<PayrollEntry>>>;
  name?: Maybe<Scalars['String']['output']>;
  payDate?: Maybe<Scalars['DateTime']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  /** draft or finalized. */
  status?: Maybe<Scalars['String']['output']>;
  totalNetPay?: Maybe<Scalars['Decimal']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type Process = {
  __typename?: 'Process';
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type ProductionBoard = {
  __typename?: 'ProductionBoard';
  /** Whether the signed-in account may pass checks and complete tasks. */
  canSupervise?: Maybe<Scalars['Boolean']['output']>;
  claimMode?: Maybe<Scalars['String']['output']>;
  tasks?: Maybe<Array<Maybe<WorkOrder>>>;
};

export type PurchaseInvoice = {
  __typename?: 'PurchaseInvoice';
  amount?: Maybe<Scalars['Decimal']['output']>;
  balance?: Maybe<Scalars['Decimal']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  paidAmount?: Maybe<Scalars['Decimal']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethodName?: Maybe<Scalars['String']['output']>;
  purchaseOrder?: Maybe<PurchaseOrder>;
  purchaseOrderCode?: Maybe<Scalars['String']['output']>;
  purchaseOrderUuid?: Maybe<Scalars['ID']['output']>;
  receiptNoteCode?: Maybe<Scalars['String']['output']>;
  receiptNoteUuid?: Maybe<Scalars['ID']['output']>;
  referenceNo?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Supplier>;
  supplierName?: Maybe<Scalars['String']['output']>;
  supplierUuid?: Maybe<Scalars['ID']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type PurchaseInvoiceRequest = {
  purchaseInvoiceUuid?: InputMaybe<Scalars['ID']['input']>;
  purchaseOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type PurchaseOrder = {
  __typename?: 'PurchaseOrder';
  billingStatus?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  expectedDate?: Maybe<Scalars['DateTime']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  items?: Maybe<Array<Maybe<PurchaseOrderItem>>>;
  paidAmount?: Maybe<Scalars['Decimal']['output']>;
  purchaseInvoices?: Maybe<Array<Maybe<PurchaseInvoice>>>;
  receiptNotes?: Maybe<Array<Maybe<ReceiptNote>>>;
  receiptStatus?: Maybe<Scalars['String']['output']>;
  receivedQty?: Maybe<Scalars['Decimal']['output']>;
  remainingAmount?: Maybe<Scalars['Decimal']['output']>;
  remainingQty?: Maybe<Scalars['Decimal']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Supplier>;
  supplierAddress?: Maybe<Scalars['String']['output']>;
  supplierName?: Maybe<Scalars['String']['output']>;
  supplierUuid?: Maybe<Scalars['ID']['output']>;
  totalAmount?: Maybe<Scalars['Decimal']['output']>;
  totalQty?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
  warehouseName?: Maybe<Scalars['String']['output']>;
  warehouseUuid?: Maybe<Scalars['ID']['output']>;
};

export type PurchaseOrderItem = {
  __typename?: 'PurchaseOrderItem';
  amount?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  orderedQty?: Maybe<Scalars['Decimal']['output']>;
  purchaseRequestItemUuid?: Maybe<Scalars['ID']['output']>;
  receivedQty?: Maybe<Scalars['Decimal']['output']>;
  remainingQty?: Maybe<Scalars['Decimal']['output']>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  unitPrice?: Maybe<Scalars['Decimal']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type PurchaseOrderItemArg = {
  itemUuid?: InputMaybe<Scalars['ID']['input']>;
  orderedQty?: InputMaybe<Scalars['Decimal']['input']>;
  purchaseRequestItemUuid?: InputMaybe<Scalars['ID']['input']>;
  stockUomUuid?: InputMaybe<Scalars['ID']['input']>;
  unitPrice?: InputMaybe<Scalars['Decimal']['input']>;
  uomName?: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseOrderRequest = {
  purchaseOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type PurchaseRequest = {
  __typename?: 'PurchaseRequest';
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  items?: Maybe<Array<Maybe<PurchaseRequestItem>>>;
  notes?: Maybe<Scalars['String']['output']>;
  purchaseOrderCodes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  requestedBy?: Maybe<Scalars['String']['output']>;
  requiredDate?: Maybe<Scalars['DateTime']['output']>;
  /** pending, approved, partly_ordered, ordered or rejected. */
  status?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type PurchaseRequestItem = {
  __typename?: 'PurchaseRequestItem';
  estimatedUnitPrice?: Maybe<Scalars['Decimal']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemUuid?: Maybe<Scalars['ID']['output']>;
  orderedQty?: Maybe<Scalars['Decimal']['output']>;
  purchaseRequestCode?: Maybe<Scalars['String']['output']>;
  purchaseRequestUuid?: Maybe<Scalars['ID']['output']>;
  remainingQty?: Maybe<Scalars['Decimal']['output']>;
  requestedQty?: Maybe<Scalars['Decimal']['output']>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  supplierName?: Maybe<Scalars['String']['output']>;
  supplierUuid?: Maybe<Scalars['ID']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

/** supplierUuid is optional: the supplier this line is expected to come from; its price becomes the estimate. */
export type PurchaseRequestItemArg = {
  itemUuid?: InputMaybe<Scalars['ID']['input']>;
  requestedQty?: InputMaybe<Scalars['Float']['input']>;
  stockUomUuid?: InputMaybe<Scalars['ID']['input']>;
  supplierUuid?: InputMaybe<Scalars['ID']['input']>;
  uomName?: InputMaybe<Scalars['String']['input']>;
};

export type ReceiptNote = {
  __typename?: 'ReceiptNote';
  code?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  items?: Maybe<Array<Maybe<ReceiptNoteItem>>>;
  purchaseInvoiceCode?: Maybe<Scalars['String']['output']>;
  purchaseOrderCode?: Maybe<Scalars['String']['output']>;
  purchaseOrderUuid?: Maybe<Scalars['ID']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  supplierName?: Maybe<Scalars['String']['output']>;
  totalAmount?: Maybe<Scalars['Decimal']['output']>;
  totalQty?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
};

export type ReceiptNoteItem = {
  __typename?: 'ReceiptNoteItem';
  actualQty?: Maybe<Scalars['Decimal']['output']>;
  amount?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  unitPrice?: Maybe<Scalars['Decimal']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type ReceiptNoteItemArg = {
  actualQty?: InputMaybe<Scalars['Decimal']['input']>;
  purchaseOrderItemUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type ReceiptNoteRequest = {
  purchaseOrderUuid?: InputMaybe<Scalars['ID']['input']>;
  receiptNoteUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type RecordInvoicePaymentRequest = {
  amount: Scalars['Float']['input'];
  /** sales or purchase. */
  invoiceType: Scalars['String']['input'];
  invoiceUuid: Scalars['ID']['input'];
  /** Official Receipt number; required for sales invoices. */
  orNumber?: InputMaybe<Scalars['String']['input']>;
  /** Date the money was paid; defaults to today. */
  paidOn?: InputMaybe<Scalars['DateTime']['input']>;
  paymentMethodUuid: Scalars['ID']['input'];
  /** Transfer reference, check number or wallet id; required when the method asks for one. */
  referenceNo?: InputMaybe<Scalars['String']['input']>;
};

export type ReportJobCardRequest = {
  defectiveQty?: InputMaybe<Scalars['Decimal']['input']>;
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  machineHours?: InputMaybe<Scalars['Float']['input']>;
  operatorStaffUuid?: InputMaybe<Scalars['ID']['input']>;
  producedQty?: InputMaybe<Scalars['Decimal']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
  workOrderItemUuid?: InputMaybe<Scalars['ID']['input']>;
  workOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type ReviewPurchaseRequestRequest = {
  approve: Scalars['Boolean']['input'];
  uuid: Scalars['ID']['input'];
};

export type RoleLoginRequest = {
  canLogin: Scalars['Boolean']['input'];
  role: Scalars['String']['input'];
};

export type RolePermission = {
  __typename?: 'RolePermission';
  /** Whether people with this role may be given a login. */
  canLogin?: Maybe<Scalars['Boolean']['output']>;
  modules?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  role?: Maybe<Scalars['String']['output']>;
  /** Modules in modules that this role may only view, not change. */
  viewOnly?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** modules: what the role can open. viewOnly: which of those it can't change; omitted keeps the current list. */
export type RolePermissionRequest = {
  modules: Array<InputMaybe<Scalars['String']['input']>>;
  role: Scalars['String']['input'];
  viewOnly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** the root of mutaion. */
export type RootMutationType = {
  __typename?: 'RootMutationType';
  changeMyPassword?: Maybe<Scalars['Boolean']['output']>;
  clockAttendance?: Maybe<AttendanceRecord>;
  completeDeliveryNote?: Maybe<DeliveryNote>;
  completeReceiptNote?: Maybe<ReceiptNote>;
  createBom?: Maybe<Bom>;
  createCustomer?: Maybe<Customer>;
  createDeliveryNote?: Maybe<DeliveryNote>;
  createItem?: Maybe<Item>;
  createPaymentEntry?: Maybe<PaymentEntry>;
  createPaymentMethod?: Maybe<PaymentMethod>;
  createProcess?: Maybe<Process>;
  createPurchaseInvoice?: Maybe<PurchaseInvoice>;
  createPurchaseOrder?: Maybe<PurchaseOrder>;
  createPurchaseRequest?: Maybe<PurchaseRequest>;
  createReceiptNote?: Maybe<ReceiptNote>;
  createSalesInvoice?: Maybe<SalesInvoice>;
  createSalesOrder?: Maybe<SalesOrder>;
  createSupplier?: Maybe<Supplier>;
  createWorkOrder?: Maybe<WorkOrder>;
  createWorkstation?: Maybe<Workstation>;
  deleteSupplierPrice?: Maybe<Scalars['Boolean']['output']>;
  finalizePayroll?: Maybe<PayrollPeriod>;
  generatePayroll?: Maybe<PayrollPeriod>;
  login?: Maybe<User>;
  /** Moves a work order to another stage on the production board. */
  moveWorkOrderStage?: Maybe<WorkOrder>;
  recordInvoicePayment?: Maybe<InvoiceRef>;
  reportJobCard?: Maybe<WorkOrder>;
  reviewPurchaseRequest?: Maybe<PurchaseRequest>;
  saveAttendance?: Maybe<AttendanceRecord>;
  saveStaff?: Maybe<Staff>;
  /** Add or change one supplier's price for a material. Purchase orders also update it. */
  saveSupplierPrice?: Maybe<SupplierPrice>;
  saveWarehouse?: Maybe<Warehouse>;
  scheduleWorkOrder?: Maybe<WorkOrder>;
  /** The on-hand level at or below which the material shows as low stock. */
  setLowStockLevel?: Maybe<Item>;
  setMemberLogin?: Maybe<Staff>;
  setRoleLogin?: Maybe<RolePermission>;
  setUserRole?: Maybe<Staff>;
  storeFinishItem?: Maybe<WorkOrder>;
  updateBenefits?: Maybe<Benefits>;
  updateConfiguration?: Maybe<Configuration>;
  /** Settings access only. Fields left out keep their stored values. */
  updateCustomer?: Maybe<Customer>;
  /**
   * Change a material's descriptive and costing fields. Class, unit of measure and
   * stock quantities are fixed after creation: the code is derived from the class,
   * and quantities only move through stock transactions so the ledger stays whole.
   */
  updateItem?: Maybe<Item>;
  /** Change the signed-in person's own mobile, and their name if their role has Settings access. Role, email and employment stay with the owner. */
  updateMyProfile?: Maybe<Staff>;
  /** Updates the method named by request.uuid. */
  updatePaymentMethod?: Maybe<PaymentMethod>;
  updateRolePermissions?: Maybe<RolePermission>;
  /** Settings access only. */
  updateSupplier?: Maybe<Supplier>;
  /** Updates the workstation named by request.uuid. */
  updateWorkstation?: Maybe<Workstation>;
};


/** the root of mutaion. */
export type RootMutationTypeChangeMyPasswordArgs = {
  request: ChangePasswordRequest;
};


/** the root of mutaion. */
export type RootMutationTypeClockAttendanceArgs = {
  request: IdRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCompleteDeliveryNoteArgs = {
  request: DeliveryNoteRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCompleteReceiptNoteArgs = {
  request: ReceiptNoteRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateBomArgs = {
  request: CreateBomRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateCustomerArgs = {
  request: CreateCustomerRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateDeliveryNoteArgs = {
  request: CreateDeliveryNoteRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateItemArgs = {
  request: CreateItemRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreatePaymentEntryArgs = {
  request: CreatePaymentEntryRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreatePaymentMethodArgs = {
  request: CreatePaymentMethodRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateProcessArgs = {
  request: CreateProcessRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreatePurchaseInvoiceArgs = {
  request: CreatePurchaseInvoiceRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreatePurchaseOrderArgs = {
  request: CreatePurchaseOrderRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreatePurchaseRequestArgs = {
  request: CreatePurchaseRequestRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateReceiptNoteArgs = {
  request: CreateReceiptNoteRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateSalesInvoiceArgs = {
  request: CreateSalesInvoiceRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateSalesOrderArgs = {
  request: CreateSalesOrderRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateSupplierArgs = {
  request: CreateSupplierRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateWorkOrderArgs = {
  request: CreateWorkOrderRequest;
};


/** the root of mutaion. */
export type RootMutationTypeCreateWorkstationArgs = {
  request: CreateWorkstationRequest;
};


/** the root of mutaion. */
export type RootMutationTypeDeleteSupplierPriceArgs = {
  request: IdRequest;
};


/** the root of mutaion. */
export type RootMutationTypeFinalizePayrollArgs = {
  request: IdRequest;
};


/** the root of mutaion. */
export type RootMutationTypeGeneratePayrollArgs = {
  request: GeneratePayrollRequest;
};


/** the root of mutaion. */
export type RootMutationTypeLoginArgs = {
  request: LoginRequest;
};


/** the root of mutaion. */
export type RootMutationTypeMoveWorkOrderStageArgs = {
  request: MoveWorkOrderStageRequest;
};


/** the root of mutaion. */
export type RootMutationTypeRecordInvoicePaymentArgs = {
  request: RecordInvoicePaymentRequest;
};


/** the root of mutaion. */
export type RootMutationTypeReportJobCardArgs = {
  request: ReportJobCardRequest;
};


/** the root of mutaion. */
export type RootMutationTypeReviewPurchaseRequestArgs = {
  request: ReviewPurchaseRequestRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSaveAttendanceArgs = {
  request: SaveAttendanceRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSaveStaffArgs = {
  request: StaffRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSaveSupplierPriceArgs = {
  request: SupplierPriceRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSaveWarehouseArgs = {
  request: WarehouseRequest;
};


/** the root of mutaion. */
export type RootMutationTypeScheduleWorkOrderArgs = {
  request: WorkOrderRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSetLowStockLevelArgs = {
  request: LowStockLevelRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSetMemberLoginArgs = {
  request: MemberLoginRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSetRoleLoginArgs = {
  request: RoleLoginRequest;
};


/** the root of mutaion. */
export type RootMutationTypeSetUserRoleArgs = {
  request: UserRoleRequest;
};


/** the root of mutaion. */
export type RootMutationTypeStoreFinishItemArgs = {
  request: StoreFinishItemRequest;
};


/** the root of mutaion. */
export type RootMutationTypeUpdateBenefitsArgs = {
  request: BenefitsRequest;
};


/** the root of mutaion. */
export type RootMutationTypeUpdateConfigurationArgs = {
  request: UpdateConfigurationRequest;
};


/** the root of mutaion. */
export type RootMutationTypeUpdateCustomerArgs = {
  request: CreateCustomerRequest;
  uuid: Scalars['ID']['input'];
};


/** the root of mutaion. */
export type RootMutationTypeUpdateItemArgs = {
  request: UpdateItemRequest;
  uuid: Scalars['ID']['input'];
};


/** the root of mutaion. */
export type RootMutationTypeUpdateMyProfileArgs = {
  request: MyProfileRequest;
};


/** the root of mutaion. */
export type RootMutationTypeUpdatePaymentMethodArgs = {
  request: CreatePaymentMethodRequest;
};


/** the root of mutaion. */
export type RootMutationTypeUpdateRolePermissionsArgs = {
  request: RolePermissionRequest;
};


/** the root of mutaion. */
export type RootMutationTypeUpdateSupplierArgs = {
  request: CreateSupplierRequest;
  uuid: Scalars['ID']['input'];
};


/** the root of mutaion. */
export type RootMutationTypeUpdateWorkstationArgs = {
  request: CreateWorkstationRequest;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  accountBalances?: Maybe<Array<Maybe<AccountBalance>>>;
  attendance?: Maybe<Array<Maybe<AttendanceRecord>>>;
  benefits?: Maybe<Benefits>;
  bom?: Maybe<Bom>;
  boms?: Maybe<Array<Maybe<Bom>>>;
  company?: Maybe<Company>;
  configuration?: Maybe<Configuration>;
  currentUser?: Maybe<User>;
  customer?: Maybe<Customer>;
  /** Orders, invoices and payments for one customer, with running balance. */
  customerLedger?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  /** Executive dashboard widgets (SRS 3). */
  dashboard?: Maybe<Scalars['JSON']['output']>;
  deliveryNote?: Maybe<DeliveryNote>;
  deliveryNotes?: Maybe<Array<Maybe<DeliveryNote>>>;
  inventoryEntries?: Maybe<Array<Maybe<InventoryEntry>>>;
  item?: Maybe<Item>;
  items?: Maybe<Array<Maybe<Item>>>;
  journalEntries?: Maybe<Array<Maybe<JournalEntry>>>;
  listStaff?: Maybe<Array<Maybe<Staff>>>;
  manufacturedGoods?: Maybe<Array<Maybe<ManufacturedGood>>>;
  modules?: Maybe<Array<Maybe<ModuleOption>>>;
  /** Modules the signed-in user can change data in. */
  myEditModules?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  myModules?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The member record of the signed-in person, if they have one. */
  myProfile?: Maybe<Staff>;
  openPurchaseRequestItems?: Maybe<Array<Maybe<PurchaseRequestItem>>>;
  paymentEntries?: Maybe<Array<Maybe<PaymentEntry>>>;
  paymentEntry?: Maybe<PaymentEntry>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  payrollPeriods?: Maybe<Array<Maybe<PayrollPeriod>>>;
  /** Payslips for one employee (uuid = staff). */
  payslips?: Maybe<Array<Maybe<PayrollEntry>>>;
  process?: Maybe<Process>;
  processes?: Maybe<Array<Maybe<Process>>>;
  /** Production office board: work orders by stage. */
  productionBoard?: Maybe<ProductionBoard>;
  purchaseInvoice?: Maybe<PurchaseInvoice>;
  purchaseInvoices?: Maybe<Array<Maybe<PurchaseInvoice>>>;
  purchaseOrder?: Maybe<PurchaseOrder>;
  purchaseOrders?: Maybe<Array<Maybe<PurchaseOrder>>>;
  purchaseRequests?: Maybe<Array<Maybe<PurchaseRequest>>>;
  receiptNote?: Maybe<ReceiptNote>;
  receiptNotes?: Maybe<Array<Maybe<ReceiptNote>>>;
  rolePermissions?: Maybe<Array<Maybe<RolePermission>>>;
  salesInvoice?: Maybe<SalesInvoice>;
  salesInvoices?: Maybe<Array<Maybe<SalesInvoice>>>;
  salesOrder?: Maybe<SalesOrder>;
  salesOrders?: Maybe<Array<Maybe<SalesOrder>>>;
  staffPerformance?: Maybe<Array<Maybe<JobCard>>>;
  stockItems?: Maybe<Array<Maybe<StockItem>>>;
  supplier?: Maybe<Supplier>;
  /** Purchase orders, receipts, invoices and payments for one supplier. */
  supplierLedger?: Maybe<Scalars['JSON']['output']>;
  /** Last known prices from one supplier (uuid = supplier). */
  supplierPrices?: Maybe<Array<Maybe<SupplierPrice>>>;
  suppliers?: Maybe<Array<Maybe<Supplier>>>;
  unpaidPurchaseInvoicesBySupplier?: Maybe<Array<Maybe<PurchaseInvoice>>>;
  unpaidSalesInvoicesByCustomer?: Maybe<Array<Maybe<SalesInvoice>>>;
  uoms?: Maybe<Array<Maybe<Uom>>>;
  warehouses?: Maybe<Array<Maybe<Warehouse>>>;
  workOrder?: Maybe<WorkOrder>;
  workOrderItem?: Maybe<WorkOrderItem>;
  workOrderItems?: Maybe<Array<Maybe<WorkOrderItem>>>;
  workOrderStageLogs?: Maybe<Array<Maybe<WorkOrderStageLog>>>;
  workOrders?: Maybe<Array<Maybe<WorkOrder>>>;
  workstation?: Maybe<Workstation>;
  workstations?: Maybe<Array<Maybe<Workstation>>>;
};


export type RootQueryTypeAttendanceArgs = {
  request?: InputMaybe<DateRequest>;
};


export type RootQueryTypeBomArgs = {
  request: IdRequest;
};


export type RootQueryTypeCustomerArgs = {
  request: IdRequest;
};


export type RootQueryTypeCustomerLedgerArgs = {
  request: IdRequest;
};


export type RootQueryTypeDeliveryNoteArgs = {
  request: DeliveryNoteRequest;
};


export type RootQueryTypeItemArgs = {
  request: IdRequest;
};


export type RootQueryTypeManufacturedGoodsArgs = {
  request?: InputMaybe<DateRequest>;
};


export type RootQueryTypePaymentEntryArgs = {
  request: IdRequest;
};


export type RootQueryTypePaymentMethodArgs = {
  request: IdRequest;
};


export type RootQueryTypePayslipsArgs = {
  request: IdRequest;
};


export type RootQueryTypeProcessArgs = {
  request: IdRequest;
};


export type RootQueryTypePurchaseInvoiceArgs = {
  request: PurchaseInvoiceRequest;
};


export type RootQueryTypePurchaseOrderArgs = {
  request: PurchaseOrderRequest;
};


export type RootQueryTypeReceiptNoteArgs = {
  request: ReceiptNoteRequest;
};


export type RootQueryTypeSalesInvoiceArgs = {
  request: SalesInvoiceRequest;
};


export type RootQueryTypeSalesOrderArgs = {
  request: SalesOrderRequest;
};


export type RootQueryTypeStaffPerformanceArgs = {
  request: IdRequest;
};


export type RootQueryTypeSupplierArgs = {
  request: IdRequest;
};


export type RootQueryTypeSupplierLedgerArgs = {
  request: IdRequest;
};


export type RootQueryTypeSupplierPricesArgs = {
  request: IdRequest;
};


export type RootQueryTypeUnpaidPurchaseInvoicesBySupplierArgs = {
  request: IdRequest;
};


export type RootQueryTypeUnpaidSalesInvoicesByCustomerArgs = {
  request: IdRequest;
};


export type RootQueryTypeWorkOrderArgs = {
  request: IdRequest;
};


export type RootQueryTypeWorkOrderItemArgs = {
  request: IdRequest;
};


export type RootQueryTypeWorkOrderStageLogsArgs = {
  request: IdRequest;
};


export type RootQueryTypeWorkstationArgs = {
  request: IdRequest;
};

export type SalesInvoice = {
  __typename?: 'SalesInvoice';
  /** Grand total payable, VAT included. */
  amount?: Maybe<Scalars['Decimal']['output']>;
  /** amount minus paidAmount. */
  balance?: Maybe<Scalars['Decimal']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  customerAddress?: Maybe<Scalars['String']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  customerReference?: Maybe<Scalars['String']['output']>;
  customerTin?: Maybe<Scalars['String']['output']>;
  customerUuid?: Maybe<Scalars['ID']['output']>;
  discountAmount?: Maybe<Scalars['Decimal']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  invoiceDate?: Maybe<Scalars['DateTime']['output']>;
  items?: Maybe<Array<Maybe<SalesInvoiceItem>>>;
  notes?: Maybe<Scalars['String']['output']>;
  /** Official Receipt number, set when payment is confirmed. */
  orNumber?: Maybe<Scalars['String']['output']>;
  paidAmount?: Maybe<Scalars['Decimal']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethodName?: Maybe<Scalars['String']['output']>;
  paymentMethodUuid?: Maybe<Scalars['ID']['output']>;
  paymentTerms?: Maybe<Scalars['String']['output']>;
  salesOrder?: Maybe<SalesOrder>;
  salesOrderCode?: Maybe<Scalars['String']['output']>;
  salesOrderUuid?: Maybe<Scalars['ID']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  vatAmount?: Maybe<Scalars['Decimal']['output']>;
  vatMode?: Maybe<Scalars['String']['output']>;
  vatableAmount?: Maybe<Scalars['Decimal']['output']>;
};

export type SalesInvoiceItem = {
  __typename?: 'SalesInvoiceItem';
  description?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['Decimal']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemUuid?: Maybe<Scalars['ID']['output']>;
  lineTotal?: Maybe<Scalars['Decimal']['output']>;
  qty?: Maybe<Scalars['Decimal']['output']>;
  salesOrderItemUuid?: Maybe<Scalars['ID']['output']>;
  unitPrice?: Maybe<Scalars['Decimal']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type SalesInvoiceItemArg = {
  description?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['Decimal']['input']>;
  qty: Scalars['Decimal']['input'];
  salesOrderItemUuid: Scalars['ID']['input'];
  unitPrice?: InputMaybe<Scalars['Decimal']['input']>;
};

export type SalesInvoiceRequest = {
  salesInvoiceUuid?: InputMaybe<Scalars['ID']['input']>;
  salesOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type SalesOrder = {
  __typename?: 'SalesOrder';
  billingStatus?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  customerName?: Maybe<Scalars['String']['output']>;
  customerUuid?: Maybe<Scalars['ID']['output']>;
  deliveredQty?: Maybe<Scalars['Decimal']['output']>;
  deliveryNotes?: Maybe<Array<Maybe<DeliveryNote>>>;
  /** overdue, at_risk, on_track, or null. */
  deliveryRisk?: Maybe<Scalars['String']['output']>;
  deliveryStatus?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  items?: Maybe<Array<Maybe<SalesOrderItem>>>;
  notes?: Maybe<Scalars['String']['output']>;
  paidAmount?: Maybe<Scalars['Decimal']['output']>;
  remainingAmount?: Maybe<Scalars['Decimal']['output']>;
  remainingQty?: Maybe<Scalars['Decimal']['output']>;
  requiredDate?: Maybe<Scalars['DateTime']['output']>;
  salesInvoiceCode?: Maybe<Scalars['String']['output']>;
  salesInvoices?: Maybe<Array<Maybe<SalesInvoice>>>;
  status?: Maybe<Scalars['String']['output']>;
  totalAmount?: Maybe<Scalars['Decimal']['output']>;
  totalQty?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
  warehouseName?: Maybe<Scalars['String']['output']>;
  warehouseUuid?: Maybe<Scalars['ID']['output']>;
  workOrderSuggestions?: Maybe<Array<Maybe<WorkOrderSuggestion>>>;
  workOrders?: Maybe<Array<Maybe<WorkOrder>>>;
};

export type SalesOrderItem = {
  __typename?: 'SalesOrderItem';
  amount?: Maybe<Scalars['Decimal']['output']>;
  customSpec?: Maybe<Scalars['String']['output']>;
  deliveredQty?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Quantity already on sales invoices. */
  invoicedQty?: Maybe<Scalars['Decimal']['output']>;
  item?: Maybe<Item>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemUuid?: Maybe<Scalars['ID']['output']>;
  orderedQty?: Maybe<Scalars['Decimal']['output']>;
  remainingQty?: Maybe<Scalars['Decimal']['output']>;
  salesOrder?: Maybe<SalesOrder>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  /** orderedQty minus invoicedQty. */
  uninvoicedQty?: Maybe<Scalars['Decimal']['output']>;
  unitPrice?: Maybe<Scalars['Decimal']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type SalesOrderItemArg = {
  customSpec?: InputMaybe<Scalars['String']['input']>;
  itemUuid?: InputMaybe<Scalars['ID']['input']>;
  orderedQty?: InputMaybe<Scalars['Float']['input']>;
  stockUomUuid?: InputMaybe<Scalars['ID']['input']>;
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
  uomName?: InputMaybe<Scalars['String']['input']>;
};

export type SalesOrderRequest = {
  salesOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type SaveAttendanceRequest = {
  notes?: InputMaybe<Scalars['String']['input']>;
  staffUuid: Scalars['ID']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  timeIn?: InputMaybe<Scalars['DateTime']['input']>;
  timeOut?: InputMaybe<Scalars['DateTime']['input']>;
  workDate?: InputMaybe<Scalars['String']['input']>;
};

export type Staff = {
  __typename?: 'Staff';
  /** Hourly rate used by payroll. */
  baseRate?: Maybe<Scalars['Decimal']['output']>;
  company?: Maybe<Company>;
  email?: Maybe<Scalars['String']['output']>;
  /** regular, probationary, contractual or part_time. */
  employmentType?: Maybe<Scalars['String']['output']>;
  /** True when this member has an account they can sign in with. */
  hasLogin?: Maybe<Scalars['Boolean']['output']>;
  hiredAt?: Maybe<Scalars['DateTime']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
  /** The login account's role, when there is one. */
  role?: Maybe<Scalars['String']['output']>;
  shift?: Maybe<Scalars['String']['output']>;
  /** active or inactive. Inactive members stay on past records but can't be assigned new work. */
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type StaffRequest = {
  baseRate?: InputMaybe<Scalars['Float']['input']>;
  email: Scalars['String']['input'];
  employmentType?: InputMaybe<Scalars['String']['input']>;
  hiredAt?: InputMaybe<Scalars['DateTime']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  shift?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  /** Omit to create a new member. */
  uuid?: InputMaybe<Scalars['ID']['input']>;
};

export type StockItem = {
  __typename?: 'StockItem';
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  stockUom?: Maybe<StockUom>;
  totalOnHand?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
};

export type StockUom = {
  __typename?: 'StockUom';
  conversionFactor?: Maybe<Scalars['Int']['output']>;
  item?: Maybe<Item>;
  sequence?: Maybe<Scalars['Int']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type StockUomArg = {
  conversionFactor?: InputMaybe<Scalars['Int']['input']>;
  sequence?: InputMaybe<Scalars['Int']['input']>;
  uomUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type StoreFinishItemRequest = {
  storedQty?: InputMaybe<Scalars['Decimal']['input']>;
  workOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type Supplier = {
  __typename?: 'Supplier';
  address?: Maybe<Scalars['String']['output']>;
  contactFirstName?: Maybe<Scalars['String']['output']>;
  contactLastName?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPosition?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  landline?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  tin?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type SupplierPrice = {
  __typename?: 'SupplierPrice';
  itemUuid?: Maybe<Scalars['ID']['output']>;
  supplierName?: Maybe<Scalars['String']['output']>;
  supplierUuid?: Maybe<Scalars['ID']['output']>;
  unitPrice?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type SupplierPriceRequest = {
  itemUuid: Scalars['ID']['input'];
  supplierUuid: Scalars['ID']['input'];
  unitPrice: Scalars['Float']['input'];
};

export type Uom = {
  __typename?: 'Uom';
  description?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type UpdateConfigurationRequest = {
  currency?: InputMaybe<Scalars['String']['input']>;
  decimalPlaces?: InputMaybe<Scalars['Int']['input']>;
  productionClaimMode?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

/** Fields left out keep their stored values. */
export type UpdateItemRequest = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  minStockThreshold?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sellingPrice?: InputMaybe<Scalars['Decimal']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['String']['input']>;
  standardCost?: InputMaybe<Scalars['Float']['input']>;
};

export type User = {
  __typename?: 'User';
  accessToken?: Maybe<Scalars['String']['output']>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  nickname?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type UserRoleRequest = {
  role: Scalars['String']['input'];
  staffUuid: Scalars['ID']['input'];
};

export type Warehouse = {
  __typename?: 'Warehouse';
  address?: Maybe<Scalars['String']['output']>;
  area?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

/** Omit uuid to create. On update, fields left out keep their stored values. */
export type WarehouseRequest = {
  address?: InputMaybe<Scalars['String']['input']>;
  area?: InputMaybe<Scalars['String']['input']>;
  /** A member whose login role is owner or manager; their name and email are stored as the contact. Send null to clear. */
  contactStaffUuid?: InputMaybe<Scalars['ID']['input']>;
  /** The warehouse forms pick first. Setting it clears the flag on every other warehouse. */
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['ID']['input']>;
};

export type WorkOrder = {
  __typename?: 'WorkOrder';
  assignedStaffName?: Maybe<Scalars['String']['output']>;
  assignedStaffUuid?: Maybe<Scalars['ID']['output']>;
  bom?: Maybe<Bom>;
  bomUuid?: Maybe<Scalars['ID']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  endTime?: Maybe<Scalars['DateTime']['output']>;
  /** Pieces that passed quality check. */
  goodQty?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemUuid?: Maybe<Scalars['ID']['output']>;
  items?: Maybe<Array<Maybe<WorkOrderItem>>>;
  /** Labour hours from reported start and end times. */
  laborHours?: Maybe<Scalars['Float']['output']>;
  /** Lathe / CNC hours reported on this work order. */
  machineHours?: Maybe<Scalars['Decimal']['output']>;
  materialRequests?: Maybe<Array<Maybe<WorkOrderMaterialRequest>>>;
  pieceRate?: Maybe<Scalars['Decimal']['output']>;
  plannedQty?: Maybe<Scalars['Decimal']['output']>;
  producedQty?: Maybe<Scalars['Decimal']['output']>;
  rejectedQty?: Maybe<Scalars['Decimal']['output']>;
  /** Pieces the worker reported; can exceed plannedQty. */
  reportedQty?: Maybe<Scalars['Decimal']['output']>;
  salesOrderCode?: Maybe<Scalars['String']['output']>;
  salesOrderUuid?: Maybe<Scalars['ID']['output']>;
  scrapedQty?: Maybe<Scalars['Decimal']['output']>;
  /** Production board stage: queued, assigned, in_progress, quality_check, final_check, completed. */
  stage?: Maybe<Scalars['String']['output']>;
  stageChangedAt?: Maybe<Scalars['DateTime']['output']>;
  startTime?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  storedQty?: Maybe<Scalars['Decimal']['output']>;
  supplierName?: Maybe<Scalars['String']['output']>;
  supplierUuid?: Maybe<Scalars['ID']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
};

export type WorkOrderItem = {
  __typename?: 'WorkOrderItem';
  defectiveQty?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  jobCards?: Maybe<Array<Maybe<JobCard>>>;
  position?: Maybe<Scalars['Int']['output']>;
  processName?: Maybe<Scalars['String']['output']>;
  producedQty?: Maybe<Scalars['Decimal']['output']>;
  requiredQty?: Maybe<Scalars['Decimal']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  workOrder?: Maybe<WorkOrder>;
  workOrderUuid?: Maybe<Scalars['ID']['output']>;
};

export type WorkOrderMaterialRequest = {
  __typename?: 'WorkOrderMaterialRequest';
  actualQty?: Maybe<Scalars['Decimal']['output']>;
  bomUuid?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  item?: Maybe<Item>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemUuid?: Maybe<Scalars['ID']['output']>;
  receivedQty?: Maybe<Scalars['Decimal']['output']>;
  remainingQty?: Maybe<Scalars['Decimal']['output']>;
  stockUom?: Maybe<StockUom>;
  stockUomUuid?: Maybe<Scalars['ID']['output']>;
  uomName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
  warehouse?: Maybe<Warehouse>;
  warehouseUuid?: Maybe<Scalars['ID']['output']>;
  workOrder?: Maybe<WorkOrder>;
  workOrderUuid?: Maybe<Scalars['ID']['output']>;
};

export type WorkOrderRequest = {
  workOrderUuid?: InputMaybe<Scalars['ID']['input']>;
};

export type WorkOrderStageLog = {
  __typename?: 'WorkOrderStageLog';
  fromStage?: Maybe<Scalars['String']['output']>;
  goodQty?: Maybe<Scalars['Decimal']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  movedBy?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  rejectedQty?: Maybe<Scalars['Decimal']['output']>;
  reportedQty?: Maybe<Scalars['Decimal']['output']>;
  staffName?: Maybe<Scalars['String']['output']>;
  toStage?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type WorkOrderSuggestion = {
  __typename?: 'WorkOrderSuggestion';
  availableQty?: Maybe<Scalars['Decimal']['output']>;
  bomName?: Maybe<Scalars['String']['output']>;
  bomUuid?: Maybe<Scalars['ID']['output']>;
  itemName?: Maybe<Scalars['String']['output']>;
  itemUuid?: Maybe<Scalars['ID']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  salesOrderItemUuid?: Maybe<Scalars['ID']['output']>;
  suggestedQty?: Maybe<Scalars['Decimal']['output']>;
};

export type Workstation = {
  __typename?: 'Workstation';
  adminUuid?: Maybe<Scalars['String']['output']>;
  capacityHours?: Maybe<Scalars['Decimal']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  members?: Maybe<Array<Maybe<Staff>>>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  uuid?: Maybe<Scalars['ID']['output']>;
};

export type BomFieldsFragment = { __typename?: 'Bom', uuid?: string | null, code?: string | null, name?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type BenefitsFieldsFragment = { __typename?: 'Benefits', overtimeMultiplier?: number | null, defaultPieceRate?: number | null, sssRate?: number | null, philhealthRate?: number | null, pagibigRate?: number | null, withholdingTaxRate?: number | null, standardHoursPerDay?: number | null };

export type CustomerFieldsFragment = { __typename?: 'Customer', uuid?: string | null, name?: string | null, buildSpecs?: string | null, customerType?: string | null, firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null, companyName?: string | null, contactName?: string | null, phone?: string | null, alternatePhone?: string | null, landline?: string | null, email?: string | null, messengerId?: string | null, facebook?: string | null, viber?: string | null, whatsapp?: string | null, telegram?: string | null, instagram?: string | null, tiktok?: string | null, marketplaceAccount?: string | null, address?: string | null, barangay?: string | null, city?: string | null, province?: string | null, region?: string | null, postalCode?: string | null, sourcePlatform?: string | null, primaryChannel?: string | null, followUpStatus?: string | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type DeliveryNoteFieldsFragment = { __typename?: 'DeliveryNote', uuid?: string | null, code?: string | null, status?: string | null, customerName?: string | null, totalAmount?: any | null, totalQty?: any | null, salesOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type DeliveryNoteItemFieldsFragment = { __typename?: 'DeliveryNoteItem', uuid?: string | null, itemName?: string | null, actualQty?: any | null, unitPrice?: any | null, amount?: any | null, uomName?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type ItemFieldsFragment = { __typename?: 'Item', uuid?: string | null, name?: string | null, itemType?: string | null, standardCost?: any | null, stockValue?: any | null, sku?: string | null, category?: string | null, spec?: string | null, description?: string | null, sellingPrice?: any | null, minStockThreshold?: any | null, onHandQty?: any | null, reservedQty?: any | null, availableQty?: any | null, defaultStockUomUuid?: string | null, defaultStockUomName?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type JobCardFieldsFragment = { __typename?: 'JobCard', uuid?: string | null, startTime?: any | null, endTime?: any | null, status?: string | null, defectiveQty?: any | null, producedQty?: any | null, workOrderItemUuid?: string | null, workOrderUuid?: string | null, operatorStaff?: { __typename?: 'Staff', email?: string | null } | null };

export type MaterialRequestFieldsFragment = { __typename?: 'WorkOrderMaterialRequest', uuid?: string | null, itemName?: string | null, actualQty?: any | null, remainingQty?: any | null, receivedQty?: any | null, uomName?: string | null, stockUomUuid?: string | null, bomUuid?: string | null, warehouseUuid?: string | null, itemUuid?: string | null, workOrderUuid?: string | null, warehouse?: { __typename?: 'Warehouse', name?: string | null } | null };

export type PaymentEntryFieldsFragment = { __typename?: 'PaymentEntry', uuid?: string | null, code?: string | null, type?: string | null, partyName?: string | null, partyType?: string | null, partyUuid?: string | null, paymentMethodUuid?: string | null, totalAmount?: any | null, referenceNo?: string | null, paidOn?: any | null, memo?: string | null, insertedAt?: any | null, updatedAt?: any | null, paymentMethod?: { __typename?: 'PaymentMethod', name?: string | null } | null };

export type PaymentMethodsFieldsFragment = { __typename?: 'PaymentMethod', uuid?: string | null, name?: string | null, kind?: string | null, provider?: string | null, accountName?: string | null, accountNumber?: string | null, currency?: string | null, requiresReference?: boolean | null, isActive?: boolean | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type PayrollEntryFieldsFragment = { __typename?: 'PayrollEntry', uuid?: string | null, staffUuid?: string | null, staffName?: string | null, periodName?: string | null, employmentType?: string | null, hourlyRate?: any | null, daysPresent?: number | null, regularHours?: any | null, overtimeHours?: any | null, unitsProduced?: any | null, basePay?: any | null, overtimePay?: any | null, incentivePay?: any | null, grossPay?: any | null, sssDeduction?: any | null, philhealthDeduction?: any | null, pagibigDeduction?: any | null, taxDeduction?: any | null, netPay?: any | null, insertedAt?: any | null };

export type ProcessFieldsFragment = { __typename?: 'Process', uuid?: string | null, name?: string | null, code?: string | null, description?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type PurchaseInvoiceFieldsFragment = { __typename?: 'PurchaseInvoice', uuid?: string | null, code?: string | null, status?: string | null, paidAmount?: any | null, balance?: any | null, receiptNoteCode?: string | null, purchaseOrderCode?: string | null, referenceNo?: string | null, paymentMethodName?: string | null, paidAt?: any | null, amount?: any | null, supplierName?: string | null, supplierUuid?: string | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type PurchaseOrderFieldsFragment = { __typename?: 'PurchaseOrder', uuid?: string | null, code?: string | null, status?: string | null, receiptStatus?: string | null, billingStatus?: string | null, supplierUuid?: string | null, supplierName?: string | null, supplierAddress?: string | null, totalAmount?: any | null, paidAmount?: any | null, remainingAmount?: any | null, totalQty?: any | null, receivedQty?: any | null, remainingQty?: any | null, warehouseName?: string | null, expectedDate?: any | null, insertedAt?: any | null, updatedAt?: any | null };

export type PurchaseOrderItemFieldsFragment = { __typename?: 'PurchaseOrderItem', uuid?: string | null, itemName?: string | null, uomName?: string | null, unitPrice?: any | null, orderedQty?: any | null, receivedQty?: any | null, amount?: any | null };

export type PurchaseRequestItemFieldsFragment = { __typename?: 'PurchaseRequestItem', uuid?: string | null, supplierUuid?: string | null, supplierName?: string | null, purchaseRequestUuid?: string | null, purchaseRequestCode?: string | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, stockUomUuid?: string | null, requestedQty?: any | null, orderedQty?: any | null, remainingQty?: any | null, estimatedUnitPrice?: any | null };

export type ReceiptNoteFieldsFragment = { __typename?: 'ReceiptNote', uuid?: string | null, code?: string | null, status?: string | null, purchaseOrderCode?: string | null, purchaseInvoiceCode?: string | null, supplierName?: string | null, totalAmount?: any | null, totalQty?: any | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type ReceiptNoteItemFieldsFragment = { __typename?: 'ReceiptNoteItem', uuid?: string | null, itemName?: string | null, uomName?: string | null, unitPrice?: any | null, actualQty?: any | null, amount?: any | null };

export type SalesInvoiceFieldsFragment = { __typename?: 'SalesInvoice', uuid?: string | null, code?: string | null, status?: string | null, amount?: any | null, paidAmount?: any | null, balance?: any | null, customerUuid?: string | null, customerName?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, invoiceDate?: any | null, dueDate?: any | null, paymentTerms?: string | null, customerAddress?: string | null, customerTin?: string | null, customerReference?: string | null, vatMode?: string | null, subtotal?: any | null, discountAmount?: any | null, vatableAmount?: any | null, vatAmount?: any | null, notes?: string | null, orNumber?: string | null, paymentMethodName?: string | null, paidAt?: any | null, insertedAt?: any | null, updatedAt?: any | null };

export type SalesOrderFieldsFragment = { __typename?: 'SalesOrder', uuid?: string | null, code?: string | null, status?: string | null, billingStatus?: string | null, deliveryStatus?: string | null, customerName?: string | null, requiredDate?: any | null, notes?: string | null, deliveryRisk?: string | null, salesInvoiceCode?: string | null, totalAmount?: any | null, paidAmount?: any | null, remainingAmount?: any | null, totalQty?: any | null, deliveredQty?: any | null, remainingQty?: any | null, warehouseName?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type SalesOrderItemFieldsFragment = { __typename?: 'SalesOrderItem', uuid?: string | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, amount?: any | null, unitPrice?: any | null, orderedQty?: any | null, deliveredQty?: any | null, remainingQty?: any | null, invoicedQty?: any | null, uninvoicedQty?: any | null };

export type StaffFieldsFragment = { __typename?: 'Staff', uuid?: string | null, email?: string | null, name?: string | null, phone?: string | null, position?: string | null, employmentType?: string | null, shift?: string | null, hiredAt?: any | null, status?: string | null, baseRate?: any | null, hasLogin?: boolean | null, role?: string | null, insertedAt?: any | null };

export type SupplierFieldsFragment = { __typename?: 'Supplier', uuid?: string | null, name?: string | null, address?: string | null, tin?: string | null, contactFirstName?: string | null, contactLastName?: string | null, contactPosition?: string | null, contactName?: string | null, phone?: string | null, landline?: string | null, email?: string | null, notes?: string | null, insertedAt?: any | null };

export type UomFieldsFragment = { __typename?: 'Uom', uuid?: string | null, name?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type WarehouseFieldsFragment = { __typename?: 'Warehouse', uuid?: string | null, name?: string | null, address?: string | null, area?: string | null, contactName?: string | null, contactEmail?: string | null, isDefault?: boolean | null, insertedAt?: any | null, updatedAt?: any | null };

export type WorkOrderFieldsFragment = { __typename?: 'WorkOrder', uuid?: string | null, code?: string | null, title?: string | null, startTime?: any | null, endTime?: any | null, type?: string | null, status?: string | null, plannedQty?: any | null, storedQty?: any | null, producedQty?: any | null, scrapedQty?: any | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, supplierName?: string | null, supplierUuid?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, dueDate?: any | null, assignedStaffUuid?: string | null, assignedStaffName?: string | null, pieceRate?: any | null, machineHours?: any | null, laborHours?: number | null, stockUomUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null };

export type WorkOrderItemFieldsFragment = { __typename?: 'WorkOrderItem', uuid?: string | null, workOrderUuid?: string | null, itemName?: string | null, processName?: string | null, position?: number | null, requiredQty?: any | null, defectiveQty?: any | null, producedQty?: any | null, insertedAt?: any | null, updatedAt?: any | null };

export type WorkstationFieldsFragment = { __typename?: 'Workstation', uuid?: string | null, name?: string | null, code?: string | null, location?: string | null, description?: string | null, capacityHours?: any | null, isActive?: boolean | null, insertedAt?: any | null, updatedAt?: any | null };

export type ChangeMyPasswordMutationVariables = Exact<{
  request: ChangePasswordRequest;
}>;


export type ChangeMyPasswordMutation = { __typename?: 'RootMutationType', changeMyPassword?: boolean | null };

export type ClockAttendanceMutationVariables = Exact<{
  request: IdRequest;
}>;


export type ClockAttendanceMutation = { __typename?: 'RootMutationType', clockAttendance?: { __typename?: 'AttendanceRecord', uuid?: string | null, timeIn?: any | null, timeOut?: any | null } | null };

export type CompleteDeliveryNoteMutationVariables = Exact<{
  request: DeliveryNoteRequest;
}>;


export type CompleteDeliveryNoteMutation = { __typename?: 'RootMutationType', completeDeliveryNote?: { __typename?: 'DeliveryNote', status?: string | null, uuid?: string | null } | null };

export type CompleteReceiptNoteMutationVariables = Exact<{
  request: ReceiptNoteRequest;
}>;


export type CompleteReceiptNoteMutation = { __typename?: 'RootMutationType', completeReceiptNote?: { __typename?: 'ReceiptNote', status?: string | null, uuid?: string | null, code?: string | null, purchaseInvoiceCode?: string | null } | null };

export type CreateBomMutationVariables = Exact<{
  request: CreateBomRequest;
}>;


export type CreateBomMutation = { __typename?: 'RootMutationType', createBom?: { __typename?: 'Bom', name?: string | null } | null };

export type CreateCustomerMutationVariables = Exact<{
  request: CreateCustomerRequest;
}>;


export type CreateCustomerMutation = { __typename?: 'RootMutationType', createCustomer?: { __typename?: 'Customer', uuid?: string | null, name?: string | null, buildSpecs?: string | null, customerType?: string | null, firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null, companyName?: string | null, contactName?: string | null, phone?: string | null, alternatePhone?: string | null, landline?: string | null, email?: string | null, messengerId?: string | null, facebook?: string | null, viber?: string | null, whatsapp?: string | null, telegram?: string | null, instagram?: string | null, tiktok?: string | null, marketplaceAccount?: string | null, address?: string | null, barangay?: string | null, city?: string | null, province?: string | null, region?: string | null, postalCode?: string | null, sourcePlatform?: string | null, primaryChannel?: string | null, followUpStatus?: string | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type CreateDeliveryNoteMutationVariables = Exact<{
  request: CreateDeliveryNoteRequest;
}>;


export type CreateDeliveryNoteMutation = { __typename?: 'RootMutationType', createDeliveryNote?: { __typename?: 'DeliveryNote', salesOrderUuid?: string | null, totalQty?: any | null, status?: string | null, items?: Array<{ __typename?: 'DeliveryNoteItem', itemName?: string | null } | null> | null } | null };

export type CreateItemMutationVariables = Exact<{
  request: CreateItemRequest;
}>;


export type CreateItemMutation = { __typename?: 'RootMutationType', createItem?: { __typename?: 'Item', name?: string | null } | null };

export type CreatePaymentEntryMutationVariables = Exact<{
  request: CreatePaymentEntryRequest;
}>;


export type CreatePaymentEntryMutation = { __typename?: 'RootMutationType', createPaymentEntry?: { __typename?: 'PaymentEntry', uuid?: string | null } | null };

export type CreatePaymentMethodMutationVariables = Exact<{
  request: CreatePaymentMethodRequest;
}>;


export type CreatePaymentMethodMutation = { __typename?: 'RootMutationType', createPaymentMethod?: { __typename?: 'PaymentMethod', uuid?: string | null, name?: string | null, kind?: string | null, provider?: string | null, accountName?: string | null, accountNumber?: string | null, currency?: string | null, requiresReference?: boolean | null, isActive?: boolean | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type CreateProcessMutationVariables = Exact<{
  request: CreateProcessRequest;
}>;


export type CreateProcessMutation = { __typename?: 'RootMutationType', createProcess?: { __typename?: 'Process', name?: string | null } | null };

export type CreatePurchaseInvoiceMutationVariables = Exact<{
  request: CreatePurchaseInvoiceRequest;
}>;


export type CreatePurchaseInvoiceMutation = { __typename?: 'RootMutationType', createPurchaseInvoice?: { __typename?: 'PurchaseInvoice', status?: string | null, amount?: any | null } | null };

export type CreatePurchaseOrderMutationVariables = Exact<{
  request: CreatePurchaseOrderRequest;
}>;


export type CreatePurchaseOrderMutation = { __typename?: 'RootMutationType', createPurchaseOrder?: { __typename?: 'PurchaseOrder', supplierUuid?: string | null, status?: string | null, items?: Array<{ __typename?: 'PurchaseOrderItem', itemName?: string | null } | null> | null } | null };

export type CreatePurchaseRequestMutationVariables = Exact<{
  request: CreatePurchaseRequestRequest;
}>;


export type CreatePurchaseRequestMutation = { __typename?: 'RootMutationType', createPurchaseRequest?: { __typename?: 'PurchaseRequest', uuid?: string | null, code?: string | null } | null };

export type CreateReceiptNoteMutationVariables = Exact<{
  request: CreateReceiptNoteRequest;
}>;


export type CreateReceiptNoteMutation = { __typename?: 'RootMutationType', createReceiptNote?: { __typename?: 'ReceiptNote', uuid?: string | null, code?: string | null, purchaseOrderUuid?: string | null, totalQty?: any | null, status?: string | null, items?: Array<{ __typename?: 'ReceiptNoteItem', itemName?: string | null } | null> | null } | null };

export type CreateSalesInvoiceMutationVariables = Exact<{
  request: CreateSalesInvoiceRequest;
}>;


export type CreateSalesInvoiceMutation = { __typename?: 'RootMutationType', createSalesInvoice?: { __typename?: 'SalesInvoice', uuid?: string | null, code?: string | null, status?: string | null, amount?: any | null, paidAmount?: any | null, balance?: any | null, customerUuid?: string | null, customerName?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, invoiceDate?: any | null, dueDate?: any | null, paymentTerms?: string | null, customerAddress?: string | null, customerTin?: string | null, customerReference?: string | null, vatMode?: string | null, subtotal?: any | null, discountAmount?: any | null, vatableAmount?: any | null, vatAmount?: any | null, notes?: string | null, orNumber?: string | null, paymentMethodName?: string | null, paidAt?: any | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type CreateSalesOrderMutationVariables = Exact<{
  request: CreateSalesOrderRequest;
}>;


export type CreateSalesOrderMutation = { __typename?: 'RootMutationType', createSalesOrder?: { __typename?: 'SalesOrder', uuid?: string | null, code?: string | null, salesInvoiceCode?: string | null } | null };

export type CreateSupplierMutationVariables = Exact<{
  request: CreateSupplierRequest;
}>;


export type CreateSupplierMutation = { __typename?: 'RootMutationType', createSupplier?: { __typename?: 'Supplier', uuid?: string | null, name?: string | null, address?: string | null, tin?: string | null, contactFirstName?: string | null, contactLastName?: string | null, contactPosition?: string | null, contactName?: string | null, phone?: string | null, landline?: string | null, email?: string | null, notes?: string | null, insertedAt?: any | null } | null };

export type CreateWorkOrderMutationVariables = Exact<{
  request: CreateWorkOrderRequest;
}>;


export type CreateWorkOrderMutation = { __typename?: 'RootMutationType', createWorkOrder?: { __typename?: 'WorkOrder', itemUuid?: string | null, status?: string | null } | null };

export type CreateWorkstationMutationVariables = Exact<{
  request: CreateWorkstationRequest;
}>;


export type CreateWorkstationMutation = { __typename?: 'RootMutationType', createWorkstation?: { __typename?: 'Workstation', uuid?: string | null, name?: string | null, code?: string | null, location?: string | null, description?: string | null, capacityHours?: any | null, isActive?: boolean | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type DeleteSupplierPriceMutationVariables = Exact<{
  request: IdRequest;
}>;


export type DeleteSupplierPriceMutation = { __typename?: 'RootMutationType', deleteSupplierPrice?: boolean | null };

export type FinalizePayrollMutationVariables = Exact<{
  request: IdRequest;
}>;


export type FinalizePayrollMutation = { __typename?: 'RootMutationType', finalizePayroll?: { __typename?: 'PayrollPeriod', uuid?: string | null, status?: string | null } | null };

export type GeneratePayrollMutationVariables = Exact<{
  request: GeneratePayrollRequest;
}>;


export type GeneratePayrollMutation = { __typename?: 'RootMutationType', generatePayroll?: { __typename?: 'PayrollPeriod', uuid?: string | null } | null };

export type LoginMutationVariables = Exact<{
  request: LoginRequest;
}>;


export type LoginMutation = { __typename?: 'RootMutationType', login?: { __typename?: 'User', uuid?: string | null, email?: string | null, accessToken?: string | null } | null };

export type MoveWorkOrderStageMutationVariables = Exact<{
  request: MoveWorkOrderStageRequest;
}>;


export type MoveWorkOrderStageMutation = { __typename?: 'RootMutationType', moveWorkOrderStage?: { __typename?: 'WorkOrder', uuid?: string | null, stage?: string | null } | null };

export type RecordInvoicePaymentMutationVariables = Exact<{
  request: RecordInvoicePaymentRequest;
}>;


export type RecordInvoicePaymentMutation = { __typename?: 'RootMutationType', recordInvoicePayment?: { __typename?: 'InvoiceRef', uuid?: string | null, code?: string | null } | null };

export type ReportJobCardMutationVariables = Exact<{
  request: ReportJobCardRequest;
}>;


export type ReportJobCardMutation = { __typename?: 'RootMutationType', reportJobCard?: { __typename?: 'WorkOrder', status?: string | null, uuid?: string | null } | null };

export type ReviewPurchaseRequestMutationVariables = Exact<{
  request: ReviewPurchaseRequestRequest;
}>;


export type ReviewPurchaseRequestMutation = { __typename?: 'RootMutationType', reviewPurchaseRequest?: { __typename?: 'PurchaseRequest', uuid?: string | null, code?: string | null, status?: string | null } | null };

export type SaveAttendanceMutationVariables = Exact<{
  request: SaveAttendanceRequest;
}>;


export type SaveAttendanceMutation = { __typename?: 'RootMutationType', saveAttendance?: { __typename?: 'AttendanceRecord', uuid?: string | null } | null };

export type SaveStaffMutationVariables = Exact<{
  request: StaffRequest;
}>;


export type SaveStaffMutation = { __typename?: 'RootMutationType', saveStaff?: { __typename?: 'Staff', uuid?: string | null, email?: string | null, name?: string | null, phone?: string | null, position?: string | null, employmentType?: string | null, shift?: string | null, hiredAt?: any | null, status?: string | null, baseRate?: any | null, hasLogin?: boolean | null, role?: string | null, insertedAt?: any | null } | null };

export type SaveSupplierPriceMutationVariables = Exact<{
  request: SupplierPriceRequest;
}>;


export type SaveSupplierPriceMutation = { __typename?: 'RootMutationType', saveSupplierPrice?: { __typename?: 'SupplierPrice', uuid?: string | null, supplierUuid?: string | null, supplierName?: string | null, unitPrice?: any | null, updatedAt?: any | null } | null };

export type SaveWarehouseMutationVariables = Exact<{
  request: WarehouseRequest;
}>;


export type SaveWarehouseMutation = { __typename?: 'RootMutationType', saveWarehouse?: { __typename?: 'Warehouse', uuid?: string | null, name?: string | null, address?: string | null, area?: string | null, contactName?: string | null, contactEmail?: string | null, isDefault?: boolean | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type SetLowStockLevelMutationVariables = Exact<{
  request: LowStockLevelRequest;
}>;


export type SetLowStockLevelMutation = { __typename?: 'RootMutationType', setLowStockLevel?: { __typename?: 'Item', uuid?: string | null, minStockThreshold?: any | null } | null };

export type SetMemberLoginMutationVariables = Exact<{
  request: MemberLoginRequest;
}>;


export type SetMemberLoginMutation = { __typename?: 'RootMutationType', setMemberLogin?: { __typename?: 'Staff', uuid?: string | null, hasLogin?: boolean | null, role?: string | null } | null };

export type SetRoleLoginMutationVariables = Exact<{
  request: RoleLoginRequest;
}>;


export type SetRoleLoginMutation = { __typename?: 'RootMutationType', setRoleLogin?: { __typename?: 'RolePermission', role?: string | null, modules?: Array<string | null> | null, canLogin?: boolean | null } | null };

export type SetUserRoleMutationVariables = Exact<{
  request: UserRoleRequest;
}>;


export type SetUserRoleMutation = { __typename?: 'RootMutationType', setUserRole?: { __typename?: 'Staff', uuid?: string | null } | null };

export type StoreFinishItemMutationVariables = Exact<{
  request: StoreFinishItemRequest;
}>;


export type StoreFinishItemMutation = { __typename?: 'RootMutationType', storeFinishItem?: { __typename?: 'WorkOrder', status?: string | null, uuid?: string | null } | null };

export type UpdateBenefitsMutationVariables = Exact<{
  request: BenefitsRequest;
}>;


export type UpdateBenefitsMutation = { __typename?: 'RootMutationType', updateBenefits?: { __typename?: 'Benefits', overtimeMultiplier?: number | null, defaultPieceRate?: number | null, sssRate?: number | null, philhealthRate?: number | null, pagibigRate?: number | null, withholdingTaxRate?: number | null, standardHoursPerDay?: number | null } | null };

export type UpdateConfigurationMutationVariables = Exact<{
  request: UpdateConfigurationRequest;
}>;


export type UpdateConfigurationMutation = { __typename?: 'RootMutationType', updateConfiguration?: { __typename?: 'Configuration', currency?: string | null, timezone?: string | null, decimalPlaces?: number | null, productionClaimMode?: string | null } | null };

export type UpdateCustomerMutationVariables = Exact<{
  uuid: Scalars['ID']['input'];
  request: CreateCustomerRequest;
}>;


export type UpdateCustomerMutation = { __typename?: 'RootMutationType', updateCustomer?: { __typename?: 'Customer', uuid?: string | null, name?: string | null, buildSpecs?: string | null, customerType?: string | null, firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null, companyName?: string | null, contactName?: string | null, phone?: string | null, alternatePhone?: string | null, landline?: string | null, email?: string | null, messengerId?: string | null, facebook?: string | null, viber?: string | null, whatsapp?: string | null, telegram?: string | null, instagram?: string | null, tiktok?: string | null, marketplaceAccount?: string | null, address?: string | null, barangay?: string | null, city?: string | null, province?: string | null, region?: string | null, postalCode?: string | null, sourcePlatform?: string | null, primaryChannel?: string | null, followUpStatus?: string | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type UpdateItemMutationVariables = Exact<{
  uuid: Scalars['ID']['input'];
  request: UpdateItemRequest;
}>;


export type UpdateItemMutation = { __typename?: 'RootMutationType', updateItem?: { __typename?: 'Item', uuid?: string | null, name?: string | null, itemType?: string | null, standardCost?: any | null, stockValue?: any | null, sku?: string | null, category?: string | null, spec?: string | null, description?: string | null, sellingPrice?: any | null, minStockThreshold?: any | null, onHandQty?: any | null, reservedQty?: any | null, availableQty?: any | null, defaultStockUomUuid?: string | null, defaultStockUomName?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type UpdateMyProfileMutationVariables = Exact<{
  request: MyProfileRequest;
}>;


export type UpdateMyProfileMutation = { __typename?: 'RootMutationType', updateMyProfile?: { __typename?: 'Staff', uuid?: string | null, email?: string | null, name?: string | null, phone?: string | null, position?: string | null, employmentType?: string | null, shift?: string | null, hiredAt?: any | null, status?: string | null, baseRate?: any | null, hasLogin?: boolean | null, role?: string | null, insertedAt?: any | null } | null };

export type UpdatePaymentMethodMutationVariables = Exact<{
  request: CreatePaymentMethodRequest;
}>;


export type UpdatePaymentMethodMutation = { __typename?: 'RootMutationType', updatePaymentMethod?: { __typename?: 'PaymentMethod', uuid?: string | null, name?: string | null, kind?: string | null, provider?: string | null, accountName?: string | null, accountNumber?: string | null, currency?: string | null, requiresReference?: boolean | null, isActive?: boolean | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type UpdateRolePermissionsMutationVariables = Exact<{
  request: RolePermissionRequest;
}>;


export type UpdateRolePermissionsMutation = { __typename?: 'RootMutationType', updateRolePermissions?: { __typename?: 'RolePermission', role?: string | null, modules?: Array<string | null> | null, viewOnly?: Array<string | null> | null } | null };

export type UpdateSupplierMutationVariables = Exact<{
  uuid: Scalars['ID']['input'];
  request: CreateSupplierRequest;
}>;


export type UpdateSupplierMutation = { __typename?: 'RootMutationType', updateSupplier?: { __typename?: 'Supplier', uuid?: string | null, name?: string | null, address?: string | null, tin?: string | null, contactFirstName?: string | null, contactLastName?: string | null, contactPosition?: string | null, contactName?: string | null, phone?: string | null, landline?: string | null, email?: string | null, notes?: string | null, insertedAt?: any | null } | null };

export type UpdateWorkstationMutationVariables = Exact<{
  request: CreateWorkstationRequest;
}>;


export type UpdateWorkstationMutation = { __typename?: 'RootMutationType', updateWorkstation?: { __typename?: 'Workstation', uuid?: string | null, name?: string | null, code?: string | null, location?: string | null, description?: string | null, capacityHours?: any | null, isActive?: boolean | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type AttendanceQueryVariables = Exact<{
  request?: InputMaybe<DateRequest>;
}>;


export type AttendanceQuery = { __typename?: 'RootQueryType', attendance?: Array<{ __typename?: 'AttendanceRecord', uuid?: string | null, staffUuid?: string | null, staffName?: string | null, workDate?: any | null, timeIn?: any | null, timeOut?: any | null, status?: string | null, regularHours?: any | null, overtimeHours?: any | null, notes?: string | null } | null> | null };

export type BomQueryVariables = Exact<{
  request: IdRequest;
}>;


export type BomQuery = { __typename?: 'RootQueryType', bom?: { __typename?: 'Bom', uuid?: string | null, name?: string | null, itemName?: string | null, bomItems?: Array<{ __typename?: 'BomItem', uuid?: string | null, itemName?: string | null, uomName?: string | null, qty?: any | null } | null> | null, bomProcesses?: Array<{ __typename?: 'BomProcess', uuid?: string | null, position?: number | null, processName?: string | null } | null> | null } | null };

export type BomLevelsQueryVariables = Exact<{
  request: IdRequest;
}>;


export type BomLevelsQuery = { __typename?: 'RootQueryType', bom?: { __typename?: 'Bom', uuid?: string | null, code?: string | null, levels?: Array<{ __typename?: 'BomLevel', level?: number | null, itemName?: string | null, itemType?: string | null, qty?: any | null, bomCode?: string | null } | null> | null } | null };

export type BomsQueryVariables = Exact<{ [key: string]: never; }>;


export type BomsQuery = { __typename?: 'RootQueryType', boms?: Array<{ __typename?: 'Bom', uuid?: string | null, code?: string | null, name?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type BenefitsQueryVariables = Exact<{ [key: string]: never; }>;


export type BenefitsQuery = { __typename?: 'RootQueryType', benefits?: { __typename?: 'Benefits', overtimeMultiplier?: number | null, defaultPieceRate?: number | null, sssRate?: number | null, philhealthRate?: number | null, pagibigRate?: number | null, withholdingTaxRate?: number | null, standardHoursPerDay?: number | null } | null };

export type CompanyQueryVariables = Exact<{ [key: string]: never; }>;


export type CompanyQuery = { __typename?: 'RootQueryType', company?: { __typename?: 'Company', uuid?: string | null, name?: string | null } | null };

export type ConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type ConfigurationQuery = { __typename?: 'RootQueryType', configuration?: { __typename?: 'Configuration', currency?: string | null, timezone?: string | null, decimalPlaces?: number | null, productionClaimMode?: string | null } | null };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'RootQueryType', currentUser?: { __typename?: 'User', email?: string | null, uuid?: string | null, role?: string | null } | null };

export type CustomerQueryVariables = Exact<{
  request: IdRequest;
}>;


export type CustomerQuery = { __typename?: 'RootQueryType', customer?: { __typename?: 'Customer', uuid?: string | null, name?: string | null, buildSpecs?: string | null, customerType?: string | null, firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null, companyName?: string | null, contactName?: string | null, phone?: string | null, alternatePhone?: string | null, landline?: string | null, email?: string | null, messengerId?: string | null, facebook?: string | null, viber?: string | null, whatsapp?: string | null, telegram?: string | null, instagram?: string | null, tiktok?: string | null, marketplaceAccount?: string | null, address?: string | null, barangay?: string | null, city?: string | null, province?: string | null, region?: string | null, postalCode?: string | null, sourcePlatform?: string | null, primaryChannel?: string | null, followUpStatus?: string | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type CustomerLedgerQueryVariables = Exact<{
  request: IdRequest;
}>;


export type CustomerLedgerQuery = { __typename?: 'RootQueryType', customerLedger?: any | null };

export type CustomersQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomersQuery = { __typename?: 'RootQueryType', customers?: Array<{ __typename?: 'Customer', uuid?: string | null, name?: string | null, buildSpecs?: string | null, customerType?: string | null, firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null, companyName?: string | null, contactName?: string | null, phone?: string | null, alternatePhone?: string | null, landline?: string | null, email?: string | null, messengerId?: string | null, facebook?: string | null, viber?: string | null, whatsapp?: string | null, telegram?: string | null, instagram?: string | null, tiktok?: string | null, marketplaceAccount?: string | null, address?: string | null, barangay?: string | null, city?: string | null, province?: string | null, region?: string | null, postalCode?: string | null, sourcePlatform?: string | null, primaryChannel?: string | null, followUpStatus?: string | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type DashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardQuery = { __typename?: 'RootQueryType', dashboard?: any | null };

export type DeliveryNoteQueryVariables = Exact<{
  request: DeliveryNoteRequest;
}>;


export type DeliveryNoteQuery = { __typename?: 'RootQueryType', deliveryNote?: { __typename?: 'DeliveryNote', uuid?: string | null, code?: string | null, status?: string | null, customerName?: string | null, totalAmount?: any | null, totalQty?: any | null, salesOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'DeliveryNoteItem', uuid?: string | null, itemName?: string | null, actualQty?: any | null, unitPrice?: any | null, amount?: any | null, uomName?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null } | null };

export type DeliveryNotesQueryVariables = Exact<{ [key: string]: never; }>;


export type DeliveryNotesQuery = { __typename?: 'RootQueryType', deliveryNotes?: Array<{ __typename?: 'DeliveryNote', uuid?: string | null, code?: string | null, status?: string | null, customerName?: string | null, totalAmount?: any | null, totalQty?: any | null, salesOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null, warehouse?: { __typename?: 'Warehouse', name?: string | null } | null } | null> | null };

export type InventoryEntriesQueryVariables = Exact<{ [key: string]: never; }>;


export type InventoryEntriesQuery = { __typename?: 'RootQueryType', inventoryEntries?: Array<{ __typename?: 'InventoryEntry', code?: string | null, actualQty?: any | null, type?: string | null, qtyAfterTransaction?: any | null, threadType?: string | null, stockUomUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null, item?: { __typename?: 'Item', uuid?: string | null, name?: string | null, itemType?: string | null, standardCost?: any | null, stockValue?: any | null, sku?: string | null, category?: string | null, spec?: string | null, description?: string | null, sellingPrice?: any | null, minStockThreshold?: any | null, onHandQty?: any | null, reservedQty?: any | null, availableQty?: any | null, defaultStockUomUuid?: string | null, defaultStockUomName?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null, warehouse?: { __typename?: 'Warehouse', uuid?: string | null, name?: string | null, address?: string | null, area?: string | null, contactName?: string | null, contactEmail?: string | null, isDefault?: boolean | null, insertedAt?: any | null, updatedAt?: any | null } | null, stockUom?: { __typename?: 'StockUom', uuid?: string | null, uomName?: string | null } | null } | null> | null };

export type ItemQueryVariables = Exact<{
  request: IdRequest;
}>;


export type ItemQuery = { __typename?: 'RootQueryType', item?: { __typename?: 'Item', uuid?: string | null, name?: string | null, description?: string | null, sellingPrice?: any | null } | null };

export type ItemSupplierPricesQueryVariables = Exact<{
  request: IdRequest;
}>;


export type ItemSupplierPricesQuery = { __typename?: 'RootQueryType', item?: { __typename?: 'Item', uuid?: string | null, minStockThreshold?: any | null, defaultStockUomName?: string | null, supplierPrices?: Array<{ __typename?: 'SupplierPrice', uuid?: string | null, supplierUuid?: string | null, supplierName?: string | null, unitPrice?: any | null, updatedAt?: any | null } | null> | null } | null };

export type ItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ItemsQuery = { __typename?: 'RootQueryType', items?: Array<{ __typename?: 'Item', uuid?: string | null, name?: string | null, itemType?: string | null, standardCost?: any | null, stockValue?: any | null, sku?: string | null, category?: string | null, spec?: string | null, description?: string | null, sellingPrice?: any | null, minStockThreshold?: any | null, onHandQty?: any | null, reservedQty?: any | null, availableQty?: any | null, defaultStockUomUuid?: string | null, defaultStockUomName?: string | null, insertedAt?: any | null, updatedAt?: any | null, stockUoms?: Array<{ __typename?: 'StockUom', uuid?: string | null, conversionFactor?: number | null, uomName?: string | null } | null> | null } | null> | null };

export type JournalEntriesQueryVariables = Exact<{ [key: string]: never; }>;


export type JournalEntriesQuery = { __typename?: 'RootQueryType', journalEntries?: Array<{ __typename?: 'JournalEntry', uuid?: string | null, entryDate?: any | null, description?: string | null, sourceType?: string | null, sourceCode?: string | null, lines?: Array<{ __typename?: 'JournalLine', uuid?: string | null, account?: string | null, debit?: any | null, credit?: any | null } | null> | null } | null> | null, accountBalances?: Array<{ __typename?: 'AccountBalance', account?: string | null, debit?: any | null, credit?: any | null, balance?: any | null } | null> | null };

export type ListStaffQueryVariables = Exact<{ [key: string]: never; }>;


export type ListStaffQuery = { __typename?: 'RootQueryType', listStaff?: Array<{ __typename?: 'Staff', uuid?: string | null, email?: string | null, name?: string | null, phone?: string | null, position?: string | null, employmentType?: string | null, shift?: string | null, hiredAt?: any | null, status?: string | null, baseRate?: any | null, hasLogin?: boolean | null, role?: string | null, insertedAt?: any | null } | null> | null };

export type ManufacturedGoodsQueryVariables = Exact<{
  request?: InputMaybe<DateRequest>;
}>;


export type ManufacturedGoodsQuery = { __typename?: 'RootQueryType', manufacturedGoods?: Array<{ __typename?: 'ManufacturedGood', uuid?: string | null, itemName?: string | null, qty?: any | null, workOrderCode?: string | null, storedAt?: any | null } | null> | null };

export type MyEditModulesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyEditModulesQuery = { __typename?: 'RootQueryType', myEditModules?: Array<string | null> | null };

export type MyModulesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyModulesQuery = { __typename?: 'RootQueryType', myModules?: Array<string | null> | null };

export type MyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyProfileQuery = { __typename?: 'RootQueryType', myProfile?: { __typename?: 'Staff', uuid?: string | null, email?: string | null, name?: string | null, phone?: string | null, position?: string | null, employmentType?: string | null, shift?: string | null, hiredAt?: any | null, status?: string | null, baseRate?: any | null, hasLogin?: boolean | null, role?: string | null, insertedAt?: any | null } | null };

export type OpenPurchaseRequestItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type OpenPurchaseRequestItemsQuery = { __typename?: 'RootQueryType', openPurchaseRequestItems?: Array<{ __typename?: 'PurchaseRequestItem', uuid?: string | null, supplierUuid?: string | null, supplierName?: string | null, purchaseRequestUuid?: string | null, purchaseRequestCode?: string | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, stockUomUuid?: string | null, requestedQty?: any | null, orderedQty?: any | null, remainingQty?: any | null, estimatedUnitPrice?: any | null } | null> | null };

export type PaymentEntriesQueryVariables = Exact<{ [key: string]: never; }>;


export type PaymentEntriesQuery = { __typename?: 'RootQueryType', paymentEntries?: Array<{ __typename?: 'PaymentEntry', uuid?: string | null, code?: string | null, type?: string | null, partyName?: string | null, partyType?: string | null, partyUuid?: string | null, paymentMethodUuid?: string | null, totalAmount?: any | null, referenceNo?: string | null, paidOn?: any | null, memo?: string | null, insertedAt?: any | null, updatedAt?: any | null, paymentMethod?: { __typename?: 'PaymentMethod', name?: string | null } | null } | null> | null };

export type PaymentEntryQueryVariables = Exact<{
  request: IdRequest;
}>;


export type PaymentEntryQuery = { __typename?: 'RootQueryType', paymentEntry?: { __typename?: 'PaymentEntry', uuid?: string | null, code?: string | null, type?: string | null, partyName?: string | null, partyType?: string | null, partyUuid?: string | null, paymentMethodUuid?: string | null, totalAmount?: any | null, referenceNo?: string | null, paidOn?: any | null, memo?: string | null, insertedAt?: any | null, updatedAt?: any | null, paymentMethod?: { __typename?: 'PaymentMethod', name?: string | null } | null } | null };

export type PaymentMethodQueryVariables = Exact<{
  request: IdRequest;
}>;


export type PaymentMethodQuery = { __typename?: 'RootQueryType', paymentMethod?: { __typename?: 'PaymentMethod', uuid?: string | null, name?: string | null, kind?: string | null, provider?: string | null, accountName?: string | null, accountNumber?: string | null, currency?: string | null, requiresReference?: boolean | null, isActive?: boolean | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type PaymentMethodsQueryVariables = Exact<{ [key: string]: never; }>;


export type PaymentMethodsQuery = { __typename?: 'RootQueryType', paymentMethods?: Array<{ __typename?: 'PaymentMethod', uuid?: string | null, name?: string | null, kind?: string | null, provider?: string | null, accountName?: string | null, accountNumber?: string | null, currency?: string | null, requiresReference?: boolean | null, isActive?: boolean | null, notes?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type PayrollPeriodsQueryVariables = Exact<{ [key: string]: never; }>;


export type PayrollPeriodsQuery = { __typename?: 'RootQueryType', payrollPeriods?: Array<{ __typename?: 'PayrollPeriod', uuid?: string | null, name?: string | null, startDate?: any | null, endDate?: any | null, payDate?: any | null, status?: string | null, totalNetPay?: any | null, entries?: Array<{ __typename?: 'PayrollEntry', uuid?: string | null, staffUuid?: string | null, staffName?: string | null, periodName?: string | null, employmentType?: string | null, hourlyRate?: any | null, daysPresent?: number | null, regularHours?: any | null, overtimeHours?: any | null, unitsProduced?: any | null, basePay?: any | null, overtimePay?: any | null, incentivePay?: any | null, grossPay?: any | null, sssDeduction?: any | null, philhealthDeduction?: any | null, pagibigDeduction?: any | null, taxDeduction?: any | null, netPay?: any | null, insertedAt?: any | null } | null> | null } | null> | null };

export type PayslipsQueryVariables = Exact<{
  request: IdRequest;
}>;


export type PayslipsQuery = { __typename?: 'RootQueryType', payslips?: Array<{ __typename?: 'PayrollEntry', uuid?: string | null, staffUuid?: string | null, staffName?: string | null, periodName?: string | null, employmentType?: string | null, hourlyRate?: any | null, daysPresent?: number | null, regularHours?: any | null, overtimeHours?: any | null, unitsProduced?: any | null, basePay?: any | null, overtimePay?: any | null, incentivePay?: any | null, grossPay?: any | null, sssDeduction?: any | null, philhealthDeduction?: any | null, pagibigDeduction?: any | null, taxDeduction?: any | null, netPay?: any | null, insertedAt?: any | null } | null> | null, staffPerformance?: Array<{ __typename?: 'JobCard', uuid?: string | null, producedQty?: any | null, defectiveQty?: any | null, insertedAt?: any | null, workOrder?: { __typename?: 'WorkOrder', uuid?: string | null, code?: string | null, itemName?: string | null } | null, workOrderItem?: { __typename?: 'WorkOrderItem', uuid?: string | null, processName?: string | null } | null } | null> | null };

export type ProcessQueryVariables = Exact<{
  request: IdRequest;
}>;


export type ProcessQuery = { __typename?: 'RootQueryType', process?: { __typename?: 'Process', uuid?: string | null } | null };

export type ProcessesQueryVariables = Exact<{ [key: string]: never; }>;


export type ProcessesQuery = { __typename?: 'RootQueryType', processes?: Array<{ __typename?: 'Process', uuid?: string | null, name?: string | null, code?: string | null, description?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type ProductionBoardQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductionBoardQuery = { __typename?: 'RootQueryType', productionBoard?: { __typename?: 'ProductionBoard', claimMode?: string | null, canSupervise?: boolean | null, tasks?: Array<{ __typename?: 'WorkOrder', uuid?: string | null, code?: string | null, itemName?: string | null, uomName?: string | null, plannedQty?: any | null, reportedQty?: any | null, goodQty?: any | null, rejectedQty?: any | null, stage?: string | null, stageChangedAt?: any | null, dueDate?: any | null, assignedStaffUuid?: string | null, assignedStaffName?: string | null, salesOrderUuid?: string | null } | null> | null } | null };

export type PurchaseInvoiceQueryVariables = Exact<{
  request: PurchaseInvoiceRequest;
}>;


export type PurchaseInvoiceQuery = { __typename?: 'RootQueryType', purchaseInvoice?: { __typename?: 'PurchaseInvoice', uuid?: string | null, code?: string | null, status?: string | null, paidAmount?: any | null, balance?: any | null, receiptNoteCode?: string | null, purchaseOrderCode?: string | null, referenceNo?: string | null, paymentMethodName?: string | null, paidAt?: any | null, amount?: any | null, supplierName?: string | null, supplierUuid?: string | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null };

export type PurchaseInvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchaseInvoicesQuery = { __typename?: 'RootQueryType', purchaseInvoices?: Array<{ __typename?: 'PurchaseInvoice', uuid?: string | null, code?: string | null, status?: string | null, paidAmount?: any | null, balance?: any | null, receiptNoteCode?: string | null, purchaseOrderCode?: string | null, referenceNo?: string | null, paymentMethodName?: string | null, paidAt?: any | null, amount?: any | null, supplierName?: string | null, supplierUuid?: string | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type PurchaseOrderQueryVariables = Exact<{
  request: PurchaseOrderRequest;
}>;


export type PurchaseOrderQuery = { __typename?: 'RootQueryType', purchaseOrder?: { __typename?: 'PurchaseOrder', uuid?: string | null, code?: string | null, status?: string | null, receiptStatus?: string | null, billingStatus?: string | null, supplierUuid?: string | null, supplierName?: string | null, supplierAddress?: string | null, totalAmount?: any | null, paidAmount?: any | null, remainingAmount?: any | null, totalQty?: any | null, receivedQty?: any | null, remainingQty?: any | null, warehouseName?: string | null, expectedDate?: any | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'PurchaseOrderItem', uuid?: string | null, itemName?: string | null, uomName?: string | null, unitPrice?: any | null, orderedQty?: any | null, receivedQty?: any | null, amount?: any | null } | null> | null, purchaseInvoices?: Array<{ __typename?: 'PurchaseInvoice', uuid?: string | null, code?: string | null, status?: string | null, paidAmount?: any | null, balance?: any | null, receiptNoteCode?: string | null, purchaseOrderCode?: string | null, referenceNo?: string | null, paymentMethodName?: string | null, paidAt?: any | null, amount?: any | null, supplierName?: string | null, supplierUuid?: string | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null, receiptNotes?: Array<{ __typename?: 'ReceiptNote', uuid?: string | null, code?: string | null, status?: string | null, purchaseOrderCode?: string | null, purchaseInvoiceCode?: string | null, supplierName?: string | null, totalAmount?: any | null, totalQty?: any | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null } | null };

export type PurchaseOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchaseOrdersQuery = { __typename?: 'RootQueryType', purchaseOrders?: Array<{ __typename?: 'PurchaseOrder', uuid?: string | null, code?: string | null, status?: string | null, receiptStatus?: string | null, billingStatus?: string | null, supplierUuid?: string | null, supplierName?: string | null, supplierAddress?: string | null, totalAmount?: any | null, paidAmount?: any | null, remainingAmount?: any | null, totalQty?: any | null, receivedQty?: any | null, remainingQty?: any | null, warehouseName?: string | null, expectedDate?: any | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'PurchaseOrderItem', uuid?: string | null, itemName?: string | null, uomName?: string | null, unitPrice?: any | null, orderedQty?: any | null, receivedQty?: any | null, amount?: any | null } | null> | null } | null> | null };

export type PurchaseRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchaseRequestsQuery = { __typename?: 'RootQueryType', purchaseRequests?: Array<{ __typename?: 'PurchaseRequest', uuid?: string | null, code?: string | null, status?: string | null, requestedBy?: string | null, requiredDate?: any | null, notes?: string | null, approvedAt?: any | null, purchaseOrderCodes?: Array<string | null> | null, insertedAt?: any | null, items?: Array<{ __typename?: 'PurchaseRequestItem', uuid?: string | null, supplierUuid?: string | null, supplierName?: string | null, purchaseRequestUuid?: string | null, purchaseRequestCode?: string | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, stockUomUuid?: string | null, requestedQty?: any | null, orderedQty?: any | null, remainingQty?: any | null, estimatedUnitPrice?: any | null } | null> | null } | null> | null };

export type ReceiptNoteQueryVariables = Exact<{
  request: ReceiptNoteRequest;
}>;


export type ReceiptNoteQuery = { __typename?: 'RootQueryType', receiptNote?: { __typename?: 'ReceiptNote', uuid?: string | null, code?: string | null, status?: string | null, purchaseOrderCode?: string | null, purchaseInvoiceCode?: string | null, supplierName?: string | null, totalAmount?: any | null, totalQty?: any | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'ReceiptNoteItem', uuid?: string | null, itemName?: string | null, uomName?: string | null, unitPrice?: any | null, actualQty?: any | null, amount?: any | null } | null> | null } | null };

export type ReceiptNotesQueryVariables = Exact<{ [key: string]: never; }>;


export type ReceiptNotesQuery = { __typename?: 'RootQueryType', receiptNotes?: Array<{ __typename?: 'ReceiptNote', uuid?: string | null, code?: string | null, status?: string | null, purchaseOrderCode?: string | null, purchaseInvoiceCode?: string | null, supplierName?: string | null, totalAmount?: any | null, totalQty?: any | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null, warehouse?: { __typename?: 'Warehouse', name?: string | null } | null } | null> | null };

export type RolePermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type RolePermissionsQuery = { __typename?: 'RootQueryType', rolePermissions?: Array<{ __typename?: 'RolePermission', role?: string | null, modules?: Array<string | null> | null, canLogin?: boolean | null, viewOnly?: Array<string | null> | null } | null> | null, modules?: Array<{ __typename?: 'ModuleOption', key?: string | null, label?: string | null } | null> | null };

export type SalesInvoiceQueryVariables = Exact<{
  request: SalesInvoiceRequest;
}>;


export type SalesInvoiceQuery = { __typename?: 'RootQueryType', salesInvoice?: { __typename?: 'SalesInvoice', uuid?: string | null, code?: string | null, status?: string | null, amount?: any | null, paidAmount?: any | null, balance?: any | null, customerUuid?: string | null, customerName?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, invoiceDate?: any | null, dueDate?: any | null, paymentTerms?: string | null, customerAddress?: string | null, customerTin?: string | null, customerReference?: string | null, vatMode?: string | null, subtotal?: any | null, discountAmount?: any | null, vatableAmount?: any | null, vatAmount?: any | null, notes?: string | null, orNumber?: string | null, paymentMethodName?: string | null, paidAt?: any | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'SalesInvoiceItem', uuid?: string | null, itemName?: string | null, description?: string | null, uomName?: string | null, qty?: any | null, unitPrice?: any | null, discount?: any | null, lineTotal?: any | null } | null> | null } | null };

export type SalesInvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type SalesInvoicesQuery = { __typename?: 'RootQueryType', salesInvoices?: Array<{ __typename?: 'SalesInvoice', uuid?: string | null, code?: string | null, status?: string | null, amount?: any | null, paidAmount?: any | null, balance?: any | null, customerUuid?: string | null, customerName?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, invoiceDate?: any | null, dueDate?: any | null, paymentTerms?: string | null, customerAddress?: string | null, customerTin?: string | null, customerReference?: string | null, vatMode?: string | null, subtotal?: any | null, discountAmount?: any | null, vatableAmount?: any | null, vatAmount?: any | null, notes?: string | null, orNumber?: string | null, paymentMethodName?: string | null, paidAt?: any | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type SalesOrderQueryVariables = Exact<{
  request: SalesOrderRequest;
}>;


export type SalesOrderQuery = { __typename?: 'RootQueryType', salesOrder?: { __typename?: 'SalesOrder', uuid?: string | null, code?: string | null, status?: string | null, billingStatus?: string | null, deliveryStatus?: string | null, customerName?: string | null, requiredDate?: any | null, notes?: string | null, deliveryRisk?: string | null, salesInvoiceCode?: string | null, totalAmount?: any | null, paidAmount?: any | null, remainingAmount?: any | null, totalQty?: any | null, deliveredQty?: any | null, remainingQty?: any | null, warehouseName?: string | null, insertedAt?: any | null, updatedAt?: any | null, customer?: { __typename?: 'Customer', address?: string | null, barangay?: string | null, city?: string | null, province?: string | null, region?: string | null, postalCode?: string | null } | null, items?: Array<{ __typename?: 'SalesOrderItem', uuid?: string | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, amount?: any | null, unitPrice?: any | null, orderedQty?: any | null, deliveredQty?: any | null, remainingQty?: any | null, invoicedQty?: any | null, uninvoicedQty?: any | null } | null> | null, deliveryNotes?: Array<{ __typename?: 'DeliveryNote', uuid?: string | null, code?: string | null, status?: string | null, customerName?: string | null, totalAmount?: any | null, totalQty?: any | null, salesOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null, salesInvoices?: Array<{ __typename?: 'SalesInvoice', uuid?: string | null, code?: string | null, status?: string | null, amount?: any | null, paidAmount?: any | null, balance?: any | null, customerUuid?: string | null, customerName?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, invoiceDate?: any | null, dueDate?: any | null, paymentTerms?: string | null, customerAddress?: string | null, customerTin?: string | null, customerReference?: string | null, vatMode?: string | null, subtotal?: any | null, discountAmount?: any | null, vatableAmount?: any | null, vatAmount?: any | null, notes?: string | null, orNumber?: string | null, paymentMethodName?: string | null, paidAt?: any | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null } | null };

export type SalesOrderWorkOrdersQueryVariables = Exact<{
  request: SalesOrderRequest;
}>;


export type SalesOrderWorkOrdersQuery = { __typename?: 'RootQueryType', salesOrder?: { __typename?: 'SalesOrder', uuid?: string | null, code?: string | null, requiredDate?: any | null, warehouseUuid?: string | null, workOrders?: Array<{ __typename?: 'WorkOrder', uuid?: string | null, code?: string | null, itemName?: string | null, plannedQty?: any | null, status?: string | null } | null> | null, workOrderSuggestions?: Array<{ __typename?: 'WorkOrderSuggestion', salesOrderItemUuid?: string | null, itemUuid?: string | null, itemName?: string | null, bomUuid?: string | null, bomName?: string | null, availableQty?: any | null, suggestedQty?: any | null, reason?: string | null } | null> | null } | null };

export type SalesOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type SalesOrdersQuery = { __typename?: 'RootQueryType', salesOrders?: Array<{ __typename?: 'SalesOrder', uuid?: string | null, code?: string | null, status?: string | null, billingStatus?: string | null, deliveryStatus?: string | null, customerName?: string | null, requiredDate?: any | null, notes?: string | null, deliveryRisk?: string | null, salesInvoiceCode?: string | null, totalAmount?: any | null, paidAmount?: any | null, remainingAmount?: any | null, totalQty?: any | null, deliveredQty?: any | null, remainingQty?: any | null, warehouseName?: string | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'SalesOrderItem', uuid?: string | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, amount?: any | null, unitPrice?: any | null, orderedQty?: any | null, deliveredQty?: any | null, remainingQty?: any | null, invoicedQty?: any | null, uninvoicedQty?: any | null } | null> | null } | null> | null };

export type ScheduleWorkOrderMutationVariables = Exact<{
  request: WorkOrderRequest;
}>;


export type ScheduleWorkOrderMutation = { __typename?: 'RootMutationType', scheduleWorkOrder?: { __typename?: 'WorkOrder', status?: string | null } | null };

export type SupplierQueryVariables = Exact<{
  request: IdRequest;
}>;


export type SupplierQuery = { __typename?: 'RootQueryType', supplier?: { __typename?: 'Supplier', uuid?: string | null, name?: string | null, address?: string | null, tin?: string | null, contactFirstName?: string | null, contactLastName?: string | null, contactPosition?: string | null, contactName?: string | null, phone?: string | null, landline?: string | null, email?: string | null, notes?: string | null, insertedAt?: any | null } | null };

export type SupplierLedgerQueryVariables = Exact<{
  request: IdRequest;
}>;


export type SupplierLedgerQuery = { __typename?: 'RootQueryType', supplierLedger?: any | null };

export type SupplierPricesQueryVariables = Exact<{
  request: IdRequest;
}>;


export type SupplierPricesQuery = { __typename?: 'RootQueryType', supplierPrices?: Array<{ __typename?: 'SupplierPrice', uuid?: string | null, supplierUuid?: string | null, itemUuid?: string | null, unitPrice?: any | null } | null> | null };

export type SuppliersQueryVariables = Exact<{ [key: string]: never; }>;


export type SuppliersQuery = { __typename?: 'RootQueryType', suppliers?: Array<{ __typename?: 'Supplier', uuid?: string | null, name?: string | null, address?: string | null, tin?: string | null, contactFirstName?: string | null, contactLastName?: string | null, contactPosition?: string | null, contactName?: string | null, phone?: string | null, landline?: string | null, email?: string | null, notes?: string | null, insertedAt?: any | null } | null> | null };

export type UoMsQueryVariables = Exact<{ [key: string]: never; }>;


export type UoMsQuery = { __typename?: 'RootQueryType', uoms?: Array<{ __typename?: 'Uom', uuid?: string | null, name?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type UnpaidPurchaseInvoicesBySupplierQueryVariables = Exact<{
  request: IdRequest;
}>;


export type UnpaidPurchaseInvoicesBySupplierQuery = { __typename?: 'RootQueryType', unpaidPurchaseInvoicesBySupplier?: Array<{ __typename?: 'PurchaseInvoice', uuid?: string | null, code?: string | null, status?: string | null, paidAmount?: any | null, balance?: any | null, receiptNoteCode?: string | null, purchaseOrderCode?: string | null, referenceNo?: string | null, paymentMethodName?: string | null, paidAt?: any | null, amount?: any | null, supplierName?: string | null, supplierUuid?: string | null, purchaseOrderUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type UnpaidSalesInvoicesByCustomerQueryVariables = Exact<{
  request: IdRequest;
}>;


export type UnpaidSalesInvoicesByCustomerQuery = { __typename?: 'RootQueryType', unpaidSalesInvoicesByCustomer?: Array<{ __typename?: 'SalesInvoice', uuid?: string | null, code?: string | null, status?: string | null, amount?: any | null, paidAmount?: any | null, balance?: any | null, customerUuid?: string | null, customerName?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, invoiceDate?: any | null, dueDate?: any | null, paymentTerms?: string | null, customerAddress?: string | null, customerTin?: string | null, customerReference?: string | null, vatMode?: string | null, subtotal?: any | null, discountAmount?: any | null, vatableAmount?: any | null, vatAmount?: any | null, notes?: string | null, orNumber?: string | null, paymentMethodName?: string | null, paidAt?: any | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type WarehousesQueryVariables = Exact<{ [key: string]: never; }>;


export type WarehousesQuery = { __typename?: 'RootQueryType', warehouses?: Array<{ __typename?: 'Warehouse', uuid?: string | null, name?: string | null, address?: string | null, area?: string | null, contactName?: string | null, contactEmail?: string | null, isDefault?: boolean | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type WorkOrderQueryVariables = Exact<{
  request: IdRequest;
}>;


export type WorkOrderQuery = { __typename?: 'RootQueryType', workOrder?: { __typename?: 'WorkOrder', uuid?: string | null, code?: string | null, title?: string | null, startTime?: any | null, endTime?: any | null, type?: string | null, status?: string | null, plannedQty?: any | null, storedQty?: any | null, producedQty?: any | null, scrapedQty?: any | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, supplierName?: string | null, supplierUuid?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, dueDate?: any | null, assignedStaffUuid?: string | null, assignedStaffName?: string | null, pieceRate?: any | null, machineHours?: any | null, laborHours?: number | null, stockUomUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null, items?: Array<{ __typename?: 'WorkOrderItem', uuid?: string | null, workOrderUuid?: string | null, itemName?: string | null, processName?: string | null, position?: number | null, requiredQty?: any | null, defectiveQty?: any | null, producedQty?: any | null, insertedAt?: any | null, updatedAt?: any | null, jobCards?: Array<{ __typename?: 'JobCard', uuid?: string | null, startTime?: any | null, endTime?: any | null, status?: string | null, defectiveQty?: any | null, producedQty?: any | null, workOrderItemUuid?: string | null, workOrderUuid?: string | null, operatorStaff?: { __typename?: 'Staff', email?: string | null } | null } | null> | null } | null> | null, materialRequests?: Array<{ __typename?: 'WorkOrderMaterialRequest', uuid?: string | null, itemName?: string | null, actualQty?: any | null, remainingQty?: any | null, receivedQty?: any | null, uomName?: string | null, stockUomUuid?: string | null, bomUuid?: string | null, warehouseUuid?: string | null, itemUuid?: string | null, workOrderUuid?: string | null, warehouse?: { __typename?: 'Warehouse', name?: string | null } | null } | null> | null } | null };

export type WorkOrderItemQueryVariables = Exact<{
  request: IdRequest;
}>;


export type WorkOrderItemQuery = { __typename?: 'RootQueryType', workOrderItem?: { __typename?: 'WorkOrderItem', uuid?: string | null, workOrderUuid?: string | null, itemName?: string | null, processName?: string | null, position?: number | null, requiredQty?: any | null, defectiveQty?: any | null, producedQty?: any | null, insertedAt?: any | null, updatedAt?: any | null, jobCards?: Array<{ __typename?: 'JobCard', uuid?: string | null, startTime?: any | null, endTime?: any | null, status?: string | null, defectiveQty?: any | null, producedQty?: any | null, workOrderItemUuid?: string | null, workOrderUuid?: string | null, operatorStaff?: { __typename?: 'Staff', email?: string | null } | null } | null> | null } | null };

export type WorkOrderItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkOrderItemsQuery = { __typename?: 'RootQueryType', workOrderItems?: Array<{ __typename?: 'WorkOrderItem', uuid?: string | null, workOrderUuid?: string | null, itemName?: string | null, processName?: string | null, position?: number | null, requiredQty?: any | null, defectiveQty?: any | null, producedQty?: any | null, insertedAt?: any | null, updatedAt?: any | null, workOrder?: { __typename?: 'WorkOrder', code?: string | null } | null } | null> | null };

export type WorkOrderStageLogsQueryVariables = Exact<{
  request: IdRequest;
}>;


export type WorkOrderStageLogsQuery = { __typename?: 'RootQueryType', workOrderStageLogs?: Array<{ __typename?: 'WorkOrderStageLog', uuid?: string | null, fromStage?: string | null, toStage?: string | null, staffName?: string | null, movedBy?: string | null, reportedQty?: any | null, goodQty?: any | null, rejectedQty?: any | null, note?: string | null, insertedAt?: any | null } | null> | null };

export type WorkOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkOrdersQuery = { __typename?: 'RootQueryType', workOrders?: Array<{ __typename?: 'WorkOrder', uuid?: string | null, code?: string | null, title?: string | null, startTime?: any | null, endTime?: any | null, type?: string | null, status?: string | null, plannedQty?: any | null, storedQty?: any | null, producedQty?: any | null, scrapedQty?: any | null, itemUuid?: string | null, itemName?: string | null, uomName?: string | null, supplierName?: string | null, supplierUuid?: string | null, salesOrderUuid?: string | null, salesOrderCode?: string | null, dueDate?: any | null, assignedStaffUuid?: string | null, assignedStaffName?: string | null, pieceRate?: any | null, machineHours?: any | null, laborHours?: number | null, stockUomUuid?: string | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export type WorkstationQueryVariables = Exact<{
  request: IdRequest;
}>;


export type WorkstationQuery = { __typename?: 'RootQueryType', workstation?: { __typename?: 'Workstation', name?: string | null } | null };

export type WorkstationsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkstationsQuery = { __typename?: 'RootQueryType', workstations?: Array<{ __typename?: 'Workstation', uuid?: string | null, name?: string | null, code?: string | null, location?: string | null, description?: string | null, capacityHours?: any | null, isActive?: boolean | null, insertedAt?: any | null, updatedAt?: any | null } | null> | null };

export const BomFieldsFragmentDoc = gql`
    fragment BOMFields on Bom {
  uuid
  code
  name
  insertedAt
  updatedAt
}
    `;
export const BenefitsFieldsFragmentDoc = gql`
    fragment BenefitsFields on Benefits {
  overtimeMultiplier
  defaultPieceRate
  sssRate
  philhealthRate
  pagibigRate
  withholdingTaxRate
  standardHoursPerDay
}
    `;
export const CustomerFieldsFragmentDoc = gql`
    fragment CustomerFields on Customer {
  uuid
  name
  buildSpecs
  customerType
  firstName
  middleName
  lastName
  suffix
  companyName
  contactName
  phone
  alternatePhone
  landline
  email
  messengerId
  facebook
  viber
  whatsapp
  telegram
  instagram
  tiktok
  marketplaceAccount
  address
  barangay
  city
  province
  region
  postalCode
  sourcePlatform
  primaryChannel
  followUpStatus
  notes
  insertedAt
  updatedAt
}
    `;
export const DeliveryNoteFieldsFragmentDoc = gql`
    fragment DeliveryNoteFields on DeliveryNote {
  uuid
  code
  status
  customerName
  totalAmount
  totalQty
  salesOrderUuid
  insertedAt
  updatedAt
}
    `;
export const DeliveryNoteItemFieldsFragmentDoc = gql`
    fragment DeliveryNoteItemFields on DeliveryNoteItem {
  uuid
  itemName
  actualQty
  unitPrice
  amount
  uomName
  insertedAt
  updatedAt
}
    `;
export const ItemFieldsFragmentDoc = gql`
    fragment ItemFields on Item {
  uuid
  name
  itemType
  standardCost
  stockValue
  sku
  category
  spec
  description
  sellingPrice
  minStockThreshold
  onHandQty
  reservedQty
  availableQty
  defaultStockUomUuid
  defaultStockUomName
  insertedAt
  updatedAt
}
    `;
export const JobCardFieldsFragmentDoc = gql`
    fragment JobCardFields on JobCard {
  uuid
  startTime
  endTime
  status
  operatorStaff {
    email
  }
  defectiveQty
  producedQty
  workOrderItemUuid
  workOrderUuid
}
    `;
export const MaterialRequestFieldsFragmentDoc = gql`
    fragment MaterialRequestFields on WorkOrderMaterialRequest {
  uuid
  itemName
  actualQty
  remainingQty
  receivedQty
  uomName
  stockUomUuid
  bomUuid
  warehouseUuid
  warehouse {
    name
  }
  itemUuid
  workOrderUuid
}
    `;
export const PaymentEntryFieldsFragmentDoc = gql`
    fragment PaymentEntryFields on PaymentEntry {
  uuid
  code
  type
  partyName
  partyType
  partyUuid
  paymentMethodUuid
  paymentMethod {
    name
  }
  totalAmount
  referenceNo
  paidOn
  memo
  insertedAt
  updatedAt
}
    `;
export const PaymentMethodsFieldsFragmentDoc = gql`
    fragment PaymentMethodsFields on PaymentMethod {
  uuid
  name
  kind
  provider
  accountName
  accountNumber
  currency
  requiresReference
  isActive
  notes
  insertedAt
  updatedAt
}
    `;
export const PayrollEntryFieldsFragmentDoc = gql`
    fragment PayrollEntryFields on PayrollEntry {
  uuid
  staffUuid
  staffName
  periodName
  employmentType
  hourlyRate
  daysPresent
  regularHours
  overtimeHours
  unitsProduced
  basePay
  overtimePay
  incentivePay
  grossPay
  sssDeduction
  philhealthDeduction
  pagibigDeduction
  taxDeduction
  netPay
  insertedAt
}
    `;
export const ProcessFieldsFragmentDoc = gql`
    fragment ProcessFields on Process {
  uuid
  name
  code
  description
  insertedAt
  updatedAt
}
    `;
export const PurchaseInvoiceFieldsFragmentDoc = gql`
    fragment PurchaseInvoiceFields on PurchaseInvoice {
  uuid
  code
  status
  paidAmount
  balance
  receiptNoteCode
  purchaseOrderCode
  referenceNo
  paymentMethodName
  paidAt
  amount
  supplierName
  supplierUuid
  purchaseOrderUuid
  insertedAt
  updatedAt
}
    `;
export const PurchaseOrderFieldsFragmentDoc = gql`
    fragment PurchaseOrderFields on PurchaseOrder {
  uuid
  code
  status
  receiptStatus
  billingStatus
  supplierUuid
  supplierName
  supplierAddress
  totalAmount
  paidAmount
  remainingAmount
  totalQty
  receivedQty
  remainingQty
  warehouseName
  expectedDate
  insertedAt
  updatedAt
}
    `;
export const PurchaseOrderItemFieldsFragmentDoc = gql`
    fragment PurchaseOrderItemFields on PurchaseOrderItem {
  uuid
  itemName
  uomName
  unitPrice
  orderedQty
  receivedQty
  amount
}
    `;
export const PurchaseRequestItemFieldsFragmentDoc = gql`
    fragment PurchaseRequestItemFields on PurchaseRequestItem {
  uuid
  supplierUuid
  supplierName
  purchaseRequestUuid
  purchaseRequestCode
  itemUuid
  itemName
  uomName
  stockUomUuid
  requestedQty
  orderedQty
  remainingQty
  estimatedUnitPrice
}
    `;
export const ReceiptNoteFieldsFragmentDoc = gql`
    fragment ReceiptNoteFields on ReceiptNote {
  uuid
  code
  status
  purchaseOrderCode
  purchaseInvoiceCode
  supplierName
  totalAmount
  totalQty
  purchaseOrderUuid
  insertedAt
  updatedAt
}
    `;
export const ReceiptNoteItemFieldsFragmentDoc = gql`
    fragment ReceiptNoteItemFields on ReceiptNoteItem {
  uuid
  itemName
  uomName
  unitPrice
  actualQty
  amount
}
    `;
export const SalesInvoiceFieldsFragmentDoc = gql`
    fragment SalesInvoiceFields on SalesInvoice {
  uuid
  code
  status
  amount
  paidAmount
  balance
  customerUuid
  customerName
  salesOrderUuid
  salesOrderCode
  invoiceDate
  dueDate
  paymentTerms
  customerAddress
  customerTin
  customerReference
  vatMode
  subtotal
  discountAmount
  vatableAmount
  vatAmount
  notes
  orNumber
  paymentMethodName
  paidAt
  insertedAt
  updatedAt
}
    `;
export const SalesOrderFieldsFragmentDoc = gql`
    fragment SalesOrderFields on SalesOrder {
  uuid
  code
  status
  billingStatus
  deliveryStatus
  customerName
  requiredDate
  notes
  deliveryRisk
  salesInvoiceCode
  totalAmount
  paidAmount
  remainingAmount
  totalQty
  deliveredQty
  remainingQty
  warehouseName
  insertedAt
  updatedAt
}
    `;
export const SalesOrderItemFieldsFragmentDoc = gql`
    fragment SalesOrderItemFields on SalesOrderItem {
  uuid
  itemUuid
  itemName
  uomName
  amount
  unitPrice
  orderedQty
  deliveredQty
  remainingQty
  invoicedQty
  uninvoicedQty
}
    `;
export const StaffFieldsFragmentDoc = gql`
    fragment StaffFields on Staff {
  uuid
  email
  name
  phone
  position
  employmentType
  shift
  hiredAt
  status
  baseRate
  hasLogin
  role
  insertedAt
}
    `;
export const SupplierFieldsFragmentDoc = gql`
    fragment SupplierFields on Supplier {
  uuid
  name
  address
  tin
  contactFirstName
  contactLastName
  contactPosition
  contactName
  phone
  landline
  email
  notes
  insertedAt
}
    `;
export const UomFieldsFragmentDoc = gql`
    fragment UOMFields on Uom {
  uuid
  name
  insertedAt
  updatedAt
}
    `;
export const WarehouseFieldsFragmentDoc = gql`
    fragment WarehouseFields on Warehouse {
  uuid
  name
  address
  area
  contactName
  contactEmail
  isDefault
  insertedAt
  updatedAt
}
    `;
export const WorkOrderFieldsFragmentDoc = gql`
    fragment WorkOrderFields on WorkOrder {
  uuid
  code
  title
  startTime
  endTime
  type
  status
  plannedQty
  storedQty
  producedQty
  scrapedQty
  itemUuid
  itemName
  uomName
  supplierName
  supplierUuid
  salesOrderUuid
  salesOrderCode
  dueDate
  assignedStaffUuid
  assignedStaffName
  pieceRate
  machineHours
  laborHours
  stockUomUuid
  insertedAt
  updatedAt
}
    `;
export const WorkOrderItemFieldsFragmentDoc = gql`
    fragment WorkOrderItemFields on WorkOrderItem {
  uuid
  workOrderUuid
  itemName
  processName
  position
  requiredQty
  defectiveQty
  producedQty
  insertedAt
  updatedAt
}
    `;
export const WorkstationFieldsFragmentDoc = gql`
    fragment WorkstationFields on Workstation {
  uuid
  name
  code
  location
  description
  capacityHours
  isActive
  insertedAt
  updatedAt
}
    `;
export const ChangeMyPasswordDocument = gql`
    mutation ChangeMyPassword($request: ChangePasswordRequest!) {
  changeMyPassword(request: $request)
}
    `;
export type ChangeMyPasswordMutationFn = Apollo.MutationFunction<ChangeMyPasswordMutation, ChangeMyPasswordMutationVariables>;

/**
 * __useChangeMyPasswordMutation__
 *
 * To run a mutation, you first call `useChangeMyPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeMyPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeMyPasswordMutation, { data, loading, error }] = useChangeMyPasswordMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useChangeMyPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ChangeMyPasswordMutation, ChangeMyPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeMyPasswordMutation, ChangeMyPasswordMutationVariables>(ChangeMyPasswordDocument, options);
      }
export type ChangeMyPasswordMutationHookResult = ReturnType<typeof useChangeMyPasswordMutation>;
export type ChangeMyPasswordMutationResult = Apollo.MutationResult<ChangeMyPasswordMutation>;
export type ChangeMyPasswordMutationOptions = Apollo.BaseMutationOptions<ChangeMyPasswordMutation, ChangeMyPasswordMutationVariables>;
export const ClockAttendanceDocument = gql`
    mutation ClockAttendance($request: IdRequest!) {
  clockAttendance(request: $request) {
    uuid
    timeIn
    timeOut
  }
}
    `;
export type ClockAttendanceMutationFn = Apollo.MutationFunction<ClockAttendanceMutation, ClockAttendanceMutationVariables>;

/**
 * __useClockAttendanceMutation__
 *
 * To run a mutation, you first call `useClockAttendanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClockAttendanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clockAttendanceMutation, { data, loading, error }] = useClockAttendanceMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useClockAttendanceMutation(baseOptions?: Apollo.MutationHookOptions<ClockAttendanceMutation, ClockAttendanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ClockAttendanceMutation, ClockAttendanceMutationVariables>(ClockAttendanceDocument, options);
      }
export type ClockAttendanceMutationHookResult = ReturnType<typeof useClockAttendanceMutation>;
export type ClockAttendanceMutationResult = Apollo.MutationResult<ClockAttendanceMutation>;
export type ClockAttendanceMutationOptions = Apollo.BaseMutationOptions<ClockAttendanceMutation, ClockAttendanceMutationVariables>;
export const CompleteDeliveryNoteDocument = gql`
    mutation CompleteDeliveryNote($request: DeliveryNoteRequest!) {
  completeDeliveryNote(request: $request) {
    status
    uuid
  }
}
    `;
export type CompleteDeliveryNoteMutationFn = Apollo.MutationFunction<CompleteDeliveryNoteMutation, CompleteDeliveryNoteMutationVariables>;

/**
 * __useCompleteDeliveryNoteMutation__
 *
 * To run a mutation, you first call `useCompleteDeliveryNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteDeliveryNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeDeliveryNoteMutation, { data, loading, error }] = useCompleteDeliveryNoteMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCompleteDeliveryNoteMutation(baseOptions?: Apollo.MutationHookOptions<CompleteDeliveryNoteMutation, CompleteDeliveryNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteDeliveryNoteMutation, CompleteDeliveryNoteMutationVariables>(CompleteDeliveryNoteDocument, options);
      }
export type CompleteDeliveryNoteMutationHookResult = ReturnType<typeof useCompleteDeliveryNoteMutation>;
export type CompleteDeliveryNoteMutationResult = Apollo.MutationResult<CompleteDeliveryNoteMutation>;
export type CompleteDeliveryNoteMutationOptions = Apollo.BaseMutationOptions<CompleteDeliveryNoteMutation, CompleteDeliveryNoteMutationVariables>;
export const CompleteReceiptNoteDocument = gql`
    mutation CompleteReceiptNote($request: ReceiptNoteRequest!) {
  completeReceiptNote(request: $request) {
    status
    uuid
    code
    purchaseInvoiceCode
  }
}
    `;
export type CompleteReceiptNoteMutationFn = Apollo.MutationFunction<CompleteReceiptNoteMutation, CompleteReceiptNoteMutationVariables>;

/**
 * __useCompleteReceiptNoteMutation__
 *
 * To run a mutation, you first call `useCompleteReceiptNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteReceiptNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeReceiptNoteMutation, { data, loading, error }] = useCompleteReceiptNoteMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCompleteReceiptNoteMutation(baseOptions?: Apollo.MutationHookOptions<CompleteReceiptNoteMutation, CompleteReceiptNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteReceiptNoteMutation, CompleteReceiptNoteMutationVariables>(CompleteReceiptNoteDocument, options);
      }
export type CompleteReceiptNoteMutationHookResult = ReturnType<typeof useCompleteReceiptNoteMutation>;
export type CompleteReceiptNoteMutationResult = Apollo.MutationResult<CompleteReceiptNoteMutation>;
export type CompleteReceiptNoteMutationOptions = Apollo.BaseMutationOptions<CompleteReceiptNoteMutation, CompleteReceiptNoteMutationVariables>;
export const CreateBomDocument = gql`
    mutation CreateBOM($request: CreateBomRequest!) {
  createBom(request: $request) {
    name
  }
}
    `;
export type CreateBomMutationFn = Apollo.MutationFunction<CreateBomMutation, CreateBomMutationVariables>;

/**
 * __useCreateBomMutation__
 *
 * To run a mutation, you first call `useCreateBomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBomMutation, { data, loading, error }] = useCreateBomMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateBomMutation(baseOptions?: Apollo.MutationHookOptions<CreateBomMutation, CreateBomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBomMutation, CreateBomMutationVariables>(CreateBomDocument, options);
      }
export type CreateBomMutationHookResult = ReturnType<typeof useCreateBomMutation>;
export type CreateBomMutationResult = Apollo.MutationResult<CreateBomMutation>;
export type CreateBomMutationOptions = Apollo.BaseMutationOptions<CreateBomMutation, CreateBomMutationVariables>;
export const CreateCustomerDocument = gql`
    mutation CreateCustomer($request: CreateCustomerRequest!) {
  createCustomer(request: $request) {
    ...CustomerFields
  }
}
    ${CustomerFieldsFragmentDoc}`;
export type CreateCustomerMutationFn = Apollo.MutationFunction<CreateCustomerMutation, CreateCustomerMutationVariables>;

/**
 * __useCreateCustomerMutation__
 *
 * To run a mutation, you first call `useCreateCustomerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCustomerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCustomerMutation, { data, loading, error }] = useCreateCustomerMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateCustomerMutation(baseOptions?: Apollo.MutationHookOptions<CreateCustomerMutation, CreateCustomerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCustomerMutation, CreateCustomerMutationVariables>(CreateCustomerDocument, options);
      }
export type CreateCustomerMutationHookResult = ReturnType<typeof useCreateCustomerMutation>;
export type CreateCustomerMutationResult = Apollo.MutationResult<CreateCustomerMutation>;
export type CreateCustomerMutationOptions = Apollo.BaseMutationOptions<CreateCustomerMutation, CreateCustomerMutationVariables>;
export const CreateDeliveryNoteDocument = gql`
    mutation CreateDeliveryNote($request: CreateDeliveryNoteRequest!) {
  createDeliveryNote(request: $request) {
    salesOrderUuid
    totalQty
    status
    items {
      itemName
    }
  }
}
    `;
export type CreateDeliveryNoteMutationFn = Apollo.MutationFunction<CreateDeliveryNoteMutation, CreateDeliveryNoteMutationVariables>;

/**
 * __useCreateDeliveryNoteMutation__
 *
 * To run a mutation, you first call `useCreateDeliveryNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDeliveryNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDeliveryNoteMutation, { data, loading, error }] = useCreateDeliveryNoteMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateDeliveryNoteMutation(baseOptions?: Apollo.MutationHookOptions<CreateDeliveryNoteMutation, CreateDeliveryNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDeliveryNoteMutation, CreateDeliveryNoteMutationVariables>(CreateDeliveryNoteDocument, options);
      }
export type CreateDeliveryNoteMutationHookResult = ReturnType<typeof useCreateDeliveryNoteMutation>;
export type CreateDeliveryNoteMutationResult = Apollo.MutationResult<CreateDeliveryNoteMutation>;
export type CreateDeliveryNoteMutationOptions = Apollo.BaseMutationOptions<CreateDeliveryNoteMutation, CreateDeliveryNoteMutationVariables>;
export const CreateItemDocument = gql`
    mutation CreateItem($request: CreateItemRequest!) {
  createItem(request: $request) {
    name
  }
}
    `;
export type CreateItemMutationFn = Apollo.MutationFunction<CreateItemMutation, CreateItemMutationVariables>;

/**
 * __useCreateItemMutation__
 *
 * To run a mutation, you first call `useCreateItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createItemMutation, { data, loading, error }] = useCreateItemMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateItemMutation(baseOptions?: Apollo.MutationHookOptions<CreateItemMutation, CreateItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateItemMutation, CreateItemMutationVariables>(CreateItemDocument, options);
      }
export type CreateItemMutationHookResult = ReturnType<typeof useCreateItemMutation>;
export type CreateItemMutationResult = Apollo.MutationResult<CreateItemMutation>;
export type CreateItemMutationOptions = Apollo.BaseMutationOptions<CreateItemMutation, CreateItemMutationVariables>;
export const CreatePaymentEntryDocument = gql`
    mutation CreatePaymentEntry($request: CreatePaymentEntryRequest!) {
  createPaymentEntry(request: $request) {
    uuid
  }
}
    `;
export type CreatePaymentEntryMutationFn = Apollo.MutationFunction<CreatePaymentEntryMutation, CreatePaymentEntryMutationVariables>;

/**
 * __useCreatePaymentEntryMutation__
 *
 * To run a mutation, you first call `useCreatePaymentEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePaymentEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPaymentEntryMutation, { data, loading, error }] = useCreatePaymentEntryMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreatePaymentEntryMutation(baseOptions?: Apollo.MutationHookOptions<CreatePaymentEntryMutation, CreatePaymentEntryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePaymentEntryMutation, CreatePaymentEntryMutationVariables>(CreatePaymentEntryDocument, options);
      }
export type CreatePaymentEntryMutationHookResult = ReturnType<typeof useCreatePaymentEntryMutation>;
export type CreatePaymentEntryMutationResult = Apollo.MutationResult<CreatePaymentEntryMutation>;
export type CreatePaymentEntryMutationOptions = Apollo.BaseMutationOptions<CreatePaymentEntryMutation, CreatePaymentEntryMutationVariables>;
export const CreatePaymentMethodDocument = gql`
    mutation CreatePaymentMethod($request: CreatePaymentMethodRequest!) {
  createPaymentMethod(request: $request) {
    ...PaymentMethodsFields
  }
}
    ${PaymentMethodsFieldsFragmentDoc}`;
export type CreatePaymentMethodMutationFn = Apollo.MutationFunction<CreatePaymentMethodMutation, CreatePaymentMethodMutationVariables>;

/**
 * __useCreatePaymentMethodMutation__
 *
 * To run a mutation, you first call `useCreatePaymentMethodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePaymentMethodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPaymentMethodMutation, { data, loading, error }] = useCreatePaymentMethodMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreatePaymentMethodMutation(baseOptions?: Apollo.MutationHookOptions<CreatePaymentMethodMutation, CreatePaymentMethodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePaymentMethodMutation, CreatePaymentMethodMutationVariables>(CreatePaymentMethodDocument, options);
      }
export type CreatePaymentMethodMutationHookResult = ReturnType<typeof useCreatePaymentMethodMutation>;
export type CreatePaymentMethodMutationResult = Apollo.MutationResult<CreatePaymentMethodMutation>;
export type CreatePaymentMethodMutationOptions = Apollo.BaseMutationOptions<CreatePaymentMethodMutation, CreatePaymentMethodMutationVariables>;
export const CreateProcessDocument = gql`
    mutation CreateProcess($request: CreateProcessRequest!) {
  createProcess(request: $request) {
    name
  }
}
    `;
export type CreateProcessMutationFn = Apollo.MutationFunction<CreateProcessMutation, CreateProcessMutationVariables>;

/**
 * __useCreateProcessMutation__
 *
 * To run a mutation, you first call `useCreateProcessMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProcessMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProcessMutation, { data, loading, error }] = useCreateProcessMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateProcessMutation(baseOptions?: Apollo.MutationHookOptions<CreateProcessMutation, CreateProcessMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProcessMutation, CreateProcessMutationVariables>(CreateProcessDocument, options);
      }
export type CreateProcessMutationHookResult = ReturnType<typeof useCreateProcessMutation>;
export type CreateProcessMutationResult = Apollo.MutationResult<CreateProcessMutation>;
export type CreateProcessMutationOptions = Apollo.BaseMutationOptions<CreateProcessMutation, CreateProcessMutationVariables>;
export const CreatePurchaseInvoiceDocument = gql`
    mutation CreatePurchaseInvoice($request: CreatePurchaseInvoiceRequest!) {
  createPurchaseInvoice(request: $request) {
    status
    amount
  }
}
    `;
export type CreatePurchaseInvoiceMutationFn = Apollo.MutationFunction<CreatePurchaseInvoiceMutation, CreatePurchaseInvoiceMutationVariables>;

/**
 * __useCreatePurchaseInvoiceMutation__
 *
 * To run a mutation, you first call `useCreatePurchaseInvoiceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePurchaseInvoiceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPurchaseInvoiceMutation, { data, loading, error }] = useCreatePurchaseInvoiceMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreatePurchaseInvoiceMutation(baseOptions?: Apollo.MutationHookOptions<CreatePurchaseInvoiceMutation, CreatePurchaseInvoiceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePurchaseInvoiceMutation, CreatePurchaseInvoiceMutationVariables>(CreatePurchaseInvoiceDocument, options);
      }
export type CreatePurchaseInvoiceMutationHookResult = ReturnType<typeof useCreatePurchaseInvoiceMutation>;
export type CreatePurchaseInvoiceMutationResult = Apollo.MutationResult<CreatePurchaseInvoiceMutation>;
export type CreatePurchaseInvoiceMutationOptions = Apollo.BaseMutationOptions<CreatePurchaseInvoiceMutation, CreatePurchaseInvoiceMutationVariables>;
export const CreatePurchaseOrderDocument = gql`
    mutation CreatePurchaseOrder($request: CreatePurchaseOrderRequest!) {
  createPurchaseOrder(request: $request) {
    supplierUuid
    status
    items {
      itemName
    }
  }
}
    `;
export type CreatePurchaseOrderMutationFn = Apollo.MutationFunction<CreatePurchaseOrderMutation, CreatePurchaseOrderMutationVariables>;

/**
 * __useCreatePurchaseOrderMutation__
 *
 * To run a mutation, you first call `useCreatePurchaseOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePurchaseOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPurchaseOrderMutation, { data, loading, error }] = useCreatePurchaseOrderMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreatePurchaseOrderMutation(baseOptions?: Apollo.MutationHookOptions<CreatePurchaseOrderMutation, CreatePurchaseOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePurchaseOrderMutation, CreatePurchaseOrderMutationVariables>(CreatePurchaseOrderDocument, options);
      }
export type CreatePurchaseOrderMutationHookResult = ReturnType<typeof useCreatePurchaseOrderMutation>;
export type CreatePurchaseOrderMutationResult = Apollo.MutationResult<CreatePurchaseOrderMutation>;
export type CreatePurchaseOrderMutationOptions = Apollo.BaseMutationOptions<CreatePurchaseOrderMutation, CreatePurchaseOrderMutationVariables>;
export const CreatePurchaseRequestDocument = gql`
    mutation CreatePurchaseRequest($request: CreatePurchaseRequestRequest!) {
  createPurchaseRequest(request: $request) {
    uuid
    code
  }
}
    `;
export type CreatePurchaseRequestMutationFn = Apollo.MutationFunction<CreatePurchaseRequestMutation, CreatePurchaseRequestMutationVariables>;

/**
 * __useCreatePurchaseRequestMutation__
 *
 * To run a mutation, you first call `useCreatePurchaseRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePurchaseRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPurchaseRequestMutation, { data, loading, error }] = useCreatePurchaseRequestMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreatePurchaseRequestMutation(baseOptions?: Apollo.MutationHookOptions<CreatePurchaseRequestMutation, CreatePurchaseRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePurchaseRequestMutation, CreatePurchaseRequestMutationVariables>(CreatePurchaseRequestDocument, options);
      }
export type CreatePurchaseRequestMutationHookResult = ReturnType<typeof useCreatePurchaseRequestMutation>;
export type CreatePurchaseRequestMutationResult = Apollo.MutationResult<CreatePurchaseRequestMutation>;
export type CreatePurchaseRequestMutationOptions = Apollo.BaseMutationOptions<CreatePurchaseRequestMutation, CreatePurchaseRequestMutationVariables>;
export const CreateReceiptNoteDocument = gql`
    mutation CreateReceiptNote($request: CreateReceiptNoteRequest!) {
  createReceiptNote(request: $request) {
    uuid
    code
    purchaseOrderUuid
    totalQty
    status
    items {
      itemName
    }
  }
}
    `;
export type CreateReceiptNoteMutationFn = Apollo.MutationFunction<CreateReceiptNoteMutation, CreateReceiptNoteMutationVariables>;

/**
 * __useCreateReceiptNoteMutation__
 *
 * To run a mutation, you first call `useCreateReceiptNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReceiptNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReceiptNoteMutation, { data, loading, error }] = useCreateReceiptNoteMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateReceiptNoteMutation(baseOptions?: Apollo.MutationHookOptions<CreateReceiptNoteMutation, CreateReceiptNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateReceiptNoteMutation, CreateReceiptNoteMutationVariables>(CreateReceiptNoteDocument, options);
      }
export type CreateReceiptNoteMutationHookResult = ReturnType<typeof useCreateReceiptNoteMutation>;
export type CreateReceiptNoteMutationResult = Apollo.MutationResult<CreateReceiptNoteMutation>;
export type CreateReceiptNoteMutationOptions = Apollo.BaseMutationOptions<CreateReceiptNoteMutation, CreateReceiptNoteMutationVariables>;
export const CreateSalesInvoiceDocument = gql`
    mutation CreateSalesInvoice($request: CreateSalesInvoiceRequest!) {
  createSalesInvoice(request: $request) {
    ...SalesInvoiceFields
  }
}
    ${SalesInvoiceFieldsFragmentDoc}`;
export type CreateSalesInvoiceMutationFn = Apollo.MutationFunction<CreateSalesInvoiceMutation, CreateSalesInvoiceMutationVariables>;

/**
 * __useCreateSalesInvoiceMutation__
 *
 * To run a mutation, you first call `useCreateSalesInvoiceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSalesInvoiceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSalesInvoiceMutation, { data, loading, error }] = useCreateSalesInvoiceMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateSalesInvoiceMutation(baseOptions?: Apollo.MutationHookOptions<CreateSalesInvoiceMutation, CreateSalesInvoiceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSalesInvoiceMutation, CreateSalesInvoiceMutationVariables>(CreateSalesInvoiceDocument, options);
      }
export type CreateSalesInvoiceMutationHookResult = ReturnType<typeof useCreateSalesInvoiceMutation>;
export type CreateSalesInvoiceMutationResult = Apollo.MutationResult<CreateSalesInvoiceMutation>;
export type CreateSalesInvoiceMutationOptions = Apollo.BaseMutationOptions<CreateSalesInvoiceMutation, CreateSalesInvoiceMutationVariables>;
export const CreateSalesOrderDocument = gql`
    mutation CreateSalesOrder($request: CreateSalesOrderRequest!) {
  createSalesOrder(request: $request) {
    uuid
    code
    salesInvoiceCode
  }
}
    `;
export type CreateSalesOrderMutationFn = Apollo.MutationFunction<CreateSalesOrderMutation, CreateSalesOrderMutationVariables>;

/**
 * __useCreateSalesOrderMutation__
 *
 * To run a mutation, you first call `useCreateSalesOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSalesOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSalesOrderMutation, { data, loading, error }] = useCreateSalesOrderMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateSalesOrderMutation(baseOptions?: Apollo.MutationHookOptions<CreateSalesOrderMutation, CreateSalesOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSalesOrderMutation, CreateSalesOrderMutationVariables>(CreateSalesOrderDocument, options);
      }
export type CreateSalesOrderMutationHookResult = ReturnType<typeof useCreateSalesOrderMutation>;
export type CreateSalesOrderMutationResult = Apollo.MutationResult<CreateSalesOrderMutation>;
export type CreateSalesOrderMutationOptions = Apollo.BaseMutationOptions<CreateSalesOrderMutation, CreateSalesOrderMutationVariables>;
export const CreateSupplierDocument = gql`
    mutation CreateSupplier($request: CreateSupplierRequest!) {
  createSupplier(request: $request) {
    ...SupplierFields
  }
}
    ${SupplierFieldsFragmentDoc}`;
export type CreateSupplierMutationFn = Apollo.MutationFunction<CreateSupplierMutation, CreateSupplierMutationVariables>;

/**
 * __useCreateSupplierMutation__
 *
 * To run a mutation, you first call `useCreateSupplierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSupplierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSupplierMutation, { data, loading, error }] = useCreateSupplierMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateSupplierMutation(baseOptions?: Apollo.MutationHookOptions<CreateSupplierMutation, CreateSupplierMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSupplierMutation, CreateSupplierMutationVariables>(CreateSupplierDocument, options);
      }
export type CreateSupplierMutationHookResult = ReturnType<typeof useCreateSupplierMutation>;
export type CreateSupplierMutationResult = Apollo.MutationResult<CreateSupplierMutation>;
export type CreateSupplierMutationOptions = Apollo.BaseMutationOptions<CreateSupplierMutation, CreateSupplierMutationVariables>;
export const CreateWorkOrderDocument = gql`
    mutation CreateWorkOrder($request: CreateWorkOrderRequest!) {
  createWorkOrder(request: $request) {
    itemUuid
    status
  }
}
    `;
export type CreateWorkOrderMutationFn = Apollo.MutationFunction<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>;

/**
 * __useCreateWorkOrderMutation__
 *
 * To run a mutation, you first call `useCreateWorkOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkOrderMutation, { data, loading, error }] = useCreateWorkOrderMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateWorkOrderMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>(CreateWorkOrderDocument, options);
      }
export type CreateWorkOrderMutationHookResult = ReturnType<typeof useCreateWorkOrderMutation>;
export type CreateWorkOrderMutationResult = Apollo.MutationResult<CreateWorkOrderMutation>;
export type CreateWorkOrderMutationOptions = Apollo.BaseMutationOptions<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>;
export const CreateWorkstationDocument = gql`
    mutation CreateWorkstation($request: CreateWorkstationRequest!) {
  createWorkstation(request: $request) {
    ...WorkstationFields
  }
}
    ${WorkstationFieldsFragmentDoc}`;
export type CreateWorkstationMutationFn = Apollo.MutationFunction<CreateWorkstationMutation, CreateWorkstationMutationVariables>;

/**
 * __useCreateWorkstationMutation__
 *
 * To run a mutation, you first call `useCreateWorkstationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkstationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkstationMutation, { data, loading, error }] = useCreateWorkstationMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCreateWorkstationMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkstationMutation, CreateWorkstationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkstationMutation, CreateWorkstationMutationVariables>(CreateWorkstationDocument, options);
      }
export type CreateWorkstationMutationHookResult = ReturnType<typeof useCreateWorkstationMutation>;
export type CreateWorkstationMutationResult = Apollo.MutationResult<CreateWorkstationMutation>;
export type CreateWorkstationMutationOptions = Apollo.BaseMutationOptions<CreateWorkstationMutation, CreateWorkstationMutationVariables>;
export const DeleteSupplierPriceDocument = gql`
    mutation DeleteSupplierPrice($request: IdRequest!) {
  deleteSupplierPrice(request: $request)
}
    `;
export type DeleteSupplierPriceMutationFn = Apollo.MutationFunction<DeleteSupplierPriceMutation, DeleteSupplierPriceMutationVariables>;

/**
 * __useDeleteSupplierPriceMutation__
 *
 * To run a mutation, you first call `useDeleteSupplierPriceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSupplierPriceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSupplierPriceMutation, { data, loading, error }] = useDeleteSupplierPriceMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useDeleteSupplierPriceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSupplierPriceMutation, DeleteSupplierPriceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSupplierPriceMutation, DeleteSupplierPriceMutationVariables>(DeleteSupplierPriceDocument, options);
      }
export type DeleteSupplierPriceMutationHookResult = ReturnType<typeof useDeleteSupplierPriceMutation>;
export type DeleteSupplierPriceMutationResult = Apollo.MutationResult<DeleteSupplierPriceMutation>;
export type DeleteSupplierPriceMutationOptions = Apollo.BaseMutationOptions<DeleteSupplierPriceMutation, DeleteSupplierPriceMutationVariables>;
export const FinalizePayrollDocument = gql`
    mutation FinalizePayroll($request: IdRequest!) {
  finalizePayroll(request: $request) {
    uuid
    status
  }
}
    `;
export type FinalizePayrollMutationFn = Apollo.MutationFunction<FinalizePayrollMutation, FinalizePayrollMutationVariables>;

/**
 * __useFinalizePayrollMutation__
 *
 * To run a mutation, you first call `useFinalizePayrollMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFinalizePayrollMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [finalizePayrollMutation, { data, loading, error }] = useFinalizePayrollMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useFinalizePayrollMutation(baseOptions?: Apollo.MutationHookOptions<FinalizePayrollMutation, FinalizePayrollMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<FinalizePayrollMutation, FinalizePayrollMutationVariables>(FinalizePayrollDocument, options);
      }
export type FinalizePayrollMutationHookResult = ReturnType<typeof useFinalizePayrollMutation>;
export type FinalizePayrollMutationResult = Apollo.MutationResult<FinalizePayrollMutation>;
export type FinalizePayrollMutationOptions = Apollo.BaseMutationOptions<FinalizePayrollMutation, FinalizePayrollMutationVariables>;
export const GeneratePayrollDocument = gql`
    mutation GeneratePayroll($request: GeneratePayrollRequest!) {
  generatePayroll(request: $request) {
    uuid
  }
}
    `;
export type GeneratePayrollMutationFn = Apollo.MutationFunction<GeneratePayrollMutation, GeneratePayrollMutationVariables>;

/**
 * __useGeneratePayrollMutation__
 *
 * To run a mutation, you first call `useGeneratePayrollMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGeneratePayrollMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generatePayrollMutation, { data, loading, error }] = useGeneratePayrollMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useGeneratePayrollMutation(baseOptions?: Apollo.MutationHookOptions<GeneratePayrollMutation, GeneratePayrollMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GeneratePayrollMutation, GeneratePayrollMutationVariables>(GeneratePayrollDocument, options);
      }
export type GeneratePayrollMutationHookResult = ReturnType<typeof useGeneratePayrollMutation>;
export type GeneratePayrollMutationResult = Apollo.MutationResult<GeneratePayrollMutation>;
export type GeneratePayrollMutationOptions = Apollo.BaseMutationOptions<GeneratePayrollMutation, GeneratePayrollMutationVariables>;
export const LoginDocument = gql`
    mutation Login($request: LoginRequest!) {
  login(request: $request) {
    uuid
    email
    accessToken
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const MoveWorkOrderStageDocument = gql`
    mutation MoveWorkOrderStage($request: MoveWorkOrderStageRequest!) {
  moveWorkOrderStage(request: $request) {
    uuid
    stage
  }
}
    `;
export type MoveWorkOrderStageMutationFn = Apollo.MutationFunction<MoveWorkOrderStageMutation, MoveWorkOrderStageMutationVariables>;

/**
 * __useMoveWorkOrderStageMutation__
 *
 * To run a mutation, you first call `useMoveWorkOrderStageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveWorkOrderStageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveWorkOrderStageMutation, { data, loading, error }] = useMoveWorkOrderStageMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useMoveWorkOrderStageMutation(baseOptions?: Apollo.MutationHookOptions<MoveWorkOrderStageMutation, MoveWorkOrderStageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveWorkOrderStageMutation, MoveWorkOrderStageMutationVariables>(MoveWorkOrderStageDocument, options);
      }
export type MoveWorkOrderStageMutationHookResult = ReturnType<typeof useMoveWorkOrderStageMutation>;
export type MoveWorkOrderStageMutationResult = Apollo.MutationResult<MoveWorkOrderStageMutation>;
export type MoveWorkOrderStageMutationOptions = Apollo.BaseMutationOptions<MoveWorkOrderStageMutation, MoveWorkOrderStageMutationVariables>;
export const RecordInvoicePaymentDocument = gql`
    mutation RecordInvoicePayment($request: RecordInvoicePaymentRequest!) {
  recordInvoicePayment(request: $request) {
    uuid
    code
  }
}
    `;
export type RecordInvoicePaymentMutationFn = Apollo.MutationFunction<RecordInvoicePaymentMutation, RecordInvoicePaymentMutationVariables>;

/**
 * __useRecordInvoicePaymentMutation__
 *
 * To run a mutation, you first call `useRecordInvoicePaymentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordInvoicePaymentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordInvoicePaymentMutation, { data, loading, error }] = useRecordInvoicePaymentMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useRecordInvoicePaymentMutation(baseOptions?: Apollo.MutationHookOptions<RecordInvoicePaymentMutation, RecordInvoicePaymentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RecordInvoicePaymentMutation, RecordInvoicePaymentMutationVariables>(RecordInvoicePaymentDocument, options);
      }
export type RecordInvoicePaymentMutationHookResult = ReturnType<typeof useRecordInvoicePaymentMutation>;
export type RecordInvoicePaymentMutationResult = Apollo.MutationResult<RecordInvoicePaymentMutation>;
export type RecordInvoicePaymentMutationOptions = Apollo.BaseMutationOptions<RecordInvoicePaymentMutation, RecordInvoicePaymentMutationVariables>;
export const ReportJobCardDocument = gql`
    mutation ReportJobCard($request: ReportJobCardRequest!) {
  reportJobCard(request: $request) {
    status
    uuid
  }
}
    `;
export type ReportJobCardMutationFn = Apollo.MutationFunction<ReportJobCardMutation, ReportJobCardMutationVariables>;

/**
 * __useReportJobCardMutation__
 *
 * To run a mutation, you first call `useReportJobCardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReportJobCardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reportJobCardMutation, { data, loading, error }] = useReportJobCardMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useReportJobCardMutation(baseOptions?: Apollo.MutationHookOptions<ReportJobCardMutation, ReportJobCardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReportJobCardMutation, ReportJobCardMutationVariables>(ReportJobCardDocument, options);
      }
export type ReportJobCardMutationHookResult = ReturnType<typeof useReportJobCardMutation>;
export type ReportJobCardMutationResult = Apollo.MutationResult<ReportJobCardMutation>;
export type ReportJobCardMutationOptions = Apollo.BaseMutationOptions<ReportJobCardMutation, ReportJobCardMutationVariables>;
export const ReviewPurchaseRequestDocument = gql`
    mutation ReviewPurchaseRequest($request: ReviewPurchaseRequestRequest!) {
  reviewPurchaseRequest(request: $request) {
    uuid
    code
    status
  }
}
    `;
export type ReviewPurchaseRequestMutationFn = Apollo.MutationFunction<ReviewPurchaseRequestMutation, ReviewPurchaseRequestMutationVariables>;

/**
 * __useReviewPurchaseRequestMutation__
 *
 * To run a mutation, you first call `useReviewPurchaseRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReviewPurchaseRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reviewPurchaseRequestMutation, { data, loading, error }] = useReviewPurchaseRequestMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useReviewPurchaseRequestMutation(baseOptions?: Apollo.MutationHookOptions<ReviewPurchaseRequestMutation, ReviewPurchaseRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReviewPurchaseRequestMutation, ReviewPurchaseRequestMutationVariables>(ReviewPurchaseRequestDocument, options);
      }
export type ReviewPurchaseRequestMutationHookResult = ReturnType<typeof useReviewPurchaseRequestMutation>;
export type ReviewPurchaseRequestMutationResult = Apollo.MutationResult<ReviewPurchaseRequestMutation>;
export type ReviewPurchaseRequestMutationOptions = Apollo.BaseMutationOptions<ReviewPurchaseRequestMutation, ReviewPurchaseRequestMutationVariables>;
export const SaveAttendanceDocument = gql`
    mutation SaveAttendance($request: SaveAttendanceRequest!) {
  saveAttendance(request: $request) {
    uuid
  }
}
    `;
export type SaveAttendanceMutationFn = Apollo.MutationFunction<SaveAttendanceMutation, SaveAttendanceMutationVariables>;

/**
 * __useSaveAttendanceMutation__
 *
 * To run a mutation, you first call `useSaveAttendanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveAttendanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveAttendanceMutation, { data, loading, error }] = useSaveAttendanceMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSaveAttendanceMutation(baseOptions?: Apollo.MutationHookOptions<SaveAttendanceMutation, SaveAttendanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveAttendanceMutation, SaveAttendanceMutationVariables>(SaveAttendanceDocument, options);
      }
export type SaveAttendanceMutationHookResult = ReturnType<typeof useSaveAttendanceMutation>;
export type SaveAttendanceMutationResult = Apollo.MutationResult<SaveAttendanceMutation>;
export type SaveAttendanceMutationOptions = Apollo.BaseMutationOptions<SaveAttendanceMutation, SaveAttendanceMutationVariables>;
export const SaveStaffDocument = gql`
    mutation SaveStaff($request: StaffRequest!) {
  saveStaff(request: $request) {
    ...StaffFields
  }
}
    ${StaffFieldsFragmentDoc}`;
export type SaveStaffMutationFn = Apollo.MutationFunction<SaveStaffMutation, SaveStaffMutationVariables>;

/**
 * __useSaveStaffMutation__
 *
 * To run a mutation, you first call `useSaveStaffMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveStaffMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveStaffMutation, { data, loading, error }] = useSaveStaffMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSaveStaffMutation(baseOptions?: Apollo.MutationHookOptions<SaveStaffMutation, SaveStaffMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveStaffMutation, SaveStaffMutationVariables>(SaveStaffDocument, options);
      }
export type SaveStaffMutationHookResult = ReturnType<typeof useSaveStaffMutation>;
export type SaveStaffMutationResult = Apollo.MutationResult<SaveStaffMutation>;
export type SaveStaffMutationOptions = Apollo.BaseMutationOptions<SaveStaffMutation, SaveStaffMutationVariables>;
export const SaveSupplierPriceDocument = gql`
    mutation SaveSupplierPrice($request: SupplierPriceRequest!) {
  saveSupplierPrice(request: $request) {
    uuid
    supplierUuid
    supplierName
    unitPrice
    updatedAt
  }
}
    `;
export type SaveSupplierPriceMutationFn = Apollo.MutationFunction<SaveSupplierPriceMutation, SaveSupplierPriceMutationVariables>;

/**
 * __useSaveSupplierPriceMutation__
 *
 * To run a mutation, you first call `useSaveSupplierPriceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveSupplierPriceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveSupplierPriceMutation, { data, loading, error }] = useSaveSupplierPriceMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSaveSupplierPriceMutation(baseOptions?: Apollo.MutationHookOptions<SaveSupplierPriceMutation, SaveSupplierPriceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveSupplierPriceMutation, SaveSupplierPriceMutationVariables>(SaveSupplierPriceDocument, options);
      }
export type SaveSupplierPriceMutationHookResult = ReturnType<typeof useSaveSupplierPriceMutation>;
export type SaveSupplierPriceMutationResult = Apollo.MutationResult<SaveSupplierPriceMutation>;
export type SaveSupplierPriceMutationOptions = Apollo.BaseMutationOptions<SaveSupplierPriceMutation, SaveSupplierPriceMutationVariables>;
export const SaveWarehouseDocument = gql`
    mutation SaveWarehouse($request: WarehouseRequest!) {
  saveWarehouse(request: $request) {
    ...WarehouseFields
  }
}
    ${WarehouseFieldsFragmentDoc}`;
export type SaveWarehouseMutationFn = Apollo.MutationFunction<SaveWarehouseMutation, SaveWarehouseMutationVariables>;

/**
 * __useSaveWarehouseMutation__
 *
 * To run a mutation, you first call `useSaveWarehouseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveWarehouseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveWarehouseMutation, { data, loading, error }] = useSaveWarehouseMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSaveWarehouseMutation(baseOptions?: Apollo.MutationHookOptions<SaveWarehouseMutation, SaveWarehouseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveWarehouseMutation, SaveWarehouseMutationVariables>(SaveWarehouseDocument, options);
      }
export type SaveWarehouseMutationHookResult = ReturnType<typeof useSaveWarehouseMutation>;
export type SaveWarehouseMutationResult = Apollo.MutationResult<SaveWarehouseMutation>;
export type SaveWarehouseMutationOptions = Apollo.BaseMutationOptions<SaveWarehouseMutation, SaveWarehouseMutationVariables>;
export const SetLowStockLevelDocument = gql`
    mutation SetLowStockLevel($request: LowStockLevelRequest!) {
  setLowStockLevel(request: $request) {
    uuid
    minStockThreshold
  }
}
    `;
export type SetLowStockLevelMutationFn = Apollo.MutationFunction<SetLowStockLevelMutation, SetLowStockLevelMutationVariables>;

/**
 * __useSetLowStockLevelMutation__
 *
 * To run a mutation, you first call `useSetLowStockLevelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetLowStockLevelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setLowStockLevelMutation, { data, loading, error }] = useSetLowStockLevelMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSetLowStockLevelMutation(baseOptions?: Apollo.MutationHookOptions<SetLowStockLevelMutation, SetLowStockLevelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetLowStockLevelMutation, SetLowStockLevelMutationVariables>(SetLowStockLevelDocument, options);
      }
export type SetLowStockLevelMutationHookResult = ReturnType<typeof useSetLowStockLevelMutation>;
export type SetLowStockLevelMutationResult = Apollo.MutationResult<SetLowStockLevelMutation>;
export type SetLowStockLevelMutationOptions = Apollo.BaseMutationOptions<SetLowStockLevelMutation, SetLowStockLevelMutationVariables>;
export const SetMemberLoginDocument = gql`
    mutation SetMemberLogin($request: MemberLoginRequest!) {
  setMemberLogin(request: $request) {
    uuid
    hasLogin
    role
  }
}
    `;
export type SetMemberLoginMutationFn = Apollo.MutationFunction<SetMemberLoginMutation, SetMemberLoginMutationVariables>;

/**
 * __useSetMemberLoginMutation__
 *
 * To run a mutation, you first call `useSetMemberLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetMemberLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setMemberLoginMutation, { data, loading, error }] = useSetMemberLoginMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSetMemberLoginMutation(baseOptions?: Apollo.MutationHookOptions<SetMemberLoginMutation, SetMemberLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetMemberLoginMutation, SetMemberLoginMutationVariables>(SetMemberLoginDocument, options);
      }
export type SetMemberLoginMutationHookResult = ReturnType<typeof useSetMemberLoginMutation>;
export type SetMemberLoginMutationResult = Apollo.MutationResult<SetMemberLoginMutation>;
export type SetMemberLoginMutationOptions = Apollo.BaseMutationOptions<SetMemberLoginMutation, SetMemberLoginMutationVariables>;
export const SetRoleLoginDocument = gql`
    mutation SetRoleLogin($request: RoleLoginRequest!) {
  setRoleLogin(request: $request) {
    role
    modules
    canLogin
  }
}
    `;
export type SetRoleLoginMutationFn = Apollo.MutationFunction<SetRoleLoginMutation, SetRoleLoginMutationVariables>;

/**
 * __useSetRoleLoginMutation__
 *
 * To run a mutation, you first call `useSetRoleLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetRoleLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setRoleLoginMutation, { data, loading, error }] = useSetRoleLoginMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSetRoleLoginMutation(baseOptions?: Apollo.MutationHookOptions<SetRoleLoginMutation, SetRoleLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetRoleLoginMutation, SetRoleLoginMutationVariables>(SetRoleLoginDocument, options);
      }
export type SetRoleLoginMutationHookResult = ReturnType<typeof useSetRoleLoginMutation>;
export type SetRoleLoginMutationResult = Apollo.MutationResult<SetRoleLoginMutation>;
export type SetRoleLoginMutationOptions = Apollo.BaseMutationOptions<SetRoleLoginMutation, SetRoleLoginMutationVariables>;
export const SetUserRoleDocument = gql`
    mutation SetUserRole($request: UserRoleRequest!) {
  setUserRole(request: $request) {
    uuid
  }
}
    `;
export type SetUserRoleMutationFn = Apollo.MutationFunction<SetUserRoleMutation, SetUserRoleMutationVariables>;

/**
 * __useSetUserRoleMutation__
 *
 * To run a mutation, you first call `useSetUserRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetUserRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setUserRoleMutation, { data, loading, error }] = useSetUserRoleMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSetUserRoleMutation(baseOptions?: Apollo.MutationHookOptions<SetUserRoleMutation, SetUserRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetUserRoleMutation, SetUserRoleMutationVariables>(SetUserRoleDocument, options);
      }
export type SetUserRoleMutationHookResult = ReturnType<typeof useSetUserRoleMutation>;
export type SetUserRoleMutationResult = Apollo.MutationResult<SetUserRoleMutation>;
export type SetUserRoleMutationOptions = Apollo.BaseMutationOptions<SetUserRoleMutation, SetUserRoleMutationVariables>;
export const StoreFinishItemDocument = gql`
    mutation StoreFinishItem($request: StoreFinishItemRequest!) {
  storeFinishItem(request: $request) {
    status
    uuid
  }
}
    `;
export type StoreFinishItemMutationFn = Apollo.MutationFunction<StoreFinishItemMutation, StoreFinishItemMutationVariables>;

/**
 * __useStoreFinishItemMutation__
 *
 * To run a mutation, you first call `useStoreFinishItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStoreFinishItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [storeFinishItemMutation, { data, loading, error }] = useStoreFinishItemMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useStoreFinishItemMutation(baseOptions?: Apollo.MutationHookOptions<StoreFinishItemMutation, StoreFinishItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StoreFinishItemMutation, StoreFinishItemMutationVariables>(StoreFinishItemDocument, options);
      }
export type StoreFinishItemMutationHookResult = ReturnType<typeof useStoreFinishItemMutation>;
export type StoreFinishItemMutationResult = Apollo.MutationResult<StoreFinishItemMutation>;
export type StoreFinishItemMutationOptions = Apollo.BaseMutationOptions<StoreFinishItemMutation, StoreFinishItemMutationVariables>;
export const UpdateBenefitsDocument = gql`
    mutation UpdateBenefits($request: BenefitsRequest!) {
  updateBenefits(request: $request) {
    ...BenefitsFields
  }
}
    ${BenefitsFieldsFragmentDoc}`;
export type UpdateBenefitsMutationFn = Apollo.MutationFunction<UpdateBenefitsMutation, UpdateBenefitsMutationVariables>;

/**
 * __useUpdateBenefitsMutation__
 *
 * To run a mutation, you first call `useUpdateBenefitsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBenefitsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBenefitsMutation, { data, loading, error }] = useUpdateBenefitsMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateBenefitsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateBenefitsMutation, UpdateBenefitsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateBenefitsMutation, UpdateBenefitsMutationVariables>(UpdateBenefitsDocument, options);
      }
export type UpdateBenefitsMutationHookResult = ReturnType<typeof useUpdateBenefitsMutation>;
export type UpdateBenefitsMutationResult = Apollo.MutationResult<UpdateBenefitsMutation>;
export type UpdateBenefitsMutationOptions = Apollo.BaseMutationOptions<UpdateBenefitsMutation, UpdateBenefitsMutationVariables>;
export const UpdateConfigurationDocument = gql`
    mutation UpdateConfiguration($request: UpdateConfigurationRequest!) {
  updateConfiguration(request: $request) {
    currency
    timezone
    decimalPlaces
    productionClaimMode
  }
}
    `;
export type UpdateConfigurationMutationFn = Apollo.MutationFunction<UpdateConfigurationMutation, UpdateConfigurationMutationVariables>;

/**
 * __useUpdateConfigurationMutation__
 *
 * To run a mutation, you first call `useUpdateConfigurationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConfigurationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConfigurationMutation, { data, loading, error }] = useUpdateConfigurationMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateConfigurationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateConfigurationMutation, UpdateConfigurationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateConfigurationMutation, UpdateConfigurationMutationVariables>(UpdateConfigurationDocument, options);
      }
export type UpdateConfigurationMutationHookResult = ReturnType<typeof useUpdateConfigurationMutation>;
export type UpdateConfigurationMutationResult = Apollo.MutationResult<UpdateConfigurationMutation>;
export type UpdateConfigurationMutationOptions = Apollo.BaseMutationOptions<UpdateConfigurationMutation, UpdateConfigurationMutationVariables>;
export const UpdateCustomerDocument = gql`
    mutation UpdateCustomer($uuid: ID!, $request: CreateCustomerRequest!) {
  updateCustomer(uuid: $uuid, request: $request) {
    ...CustomerFields
  }
}
    ${CustomerFieldsFragmentDoc}`;
export type UpdateCustomerMutationFn = Apollo.MutationFunction<UpdateCustomerMutation, UpdateCustomerMutationVariables>;

/**
 * __useUpdateCustomerMutation__
 *
 * To run a mutation, you first call `useUpdateCustomerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCustomerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCustomerMutation, { data, loading, error }] = useUpdateCustomerMutation({
 *   variables: {
 *      uuid: // value for 'uuid'
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateCustomerMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCustomerMutation, UpdateCustomerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCustomerMutation, UpdateCustomerMutationVariables>(UpdateCustomerDocument, options);
      }
export type UpdateCustomerMutationHookResult = ReturnType<typeof useUpdateCustomerMutation>;
export type UpdateCustomerMutationResult = Apollo.MutationResult<UpdateCustomerMutation>;
export type UpdateCustomerMutationOptions = Apollo.BaseMutationOptions<UpdateCustomerMutation, UpdateCustomerMutationVariables>;
export const UpdateItemDocument = gql`
    mutation UpdateItem($uuid: ID!, $request: UpdateItemRequest!) {
  updateItem(uuid: $uuid, request: $request) {
    ...ItemFields
  }
}
    ${ItemFieldsFragmentDoc}`;
export type UpdateItemMutationFn = Apollo.MutationFunction<UpdateItemMutation, UpdateItemMutationVariables>;

/**
 * __useUpdateItemMutation__
 *
 * To run a mutation, you first call `useUpdateItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateItemMutation, { data, loading, error }] = useUpdateItemMutation({
 *   variables: {
 *      uuid: // value for 'uuid'
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateItemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateItemMutation, UpdateItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateItemMutation, UpdateItemMutationVariables>(UpdateItemDocument, options);
      }
export type UpdateItemMutationHookResult = ReturnType<typeof useUpdateItemMutation>;
export type UpdateItemMutationResult = Apollo.MutationResult<UpdateItemMutation>;
export type UpdateItemMutationOptions = Apollo.BaseMutationOptions<UpdateItemMutation, UpdateItemMutationVariables>;
export const UpdateMyProfileDocument = gql`
    mutation UpdateMyProfile($request: MyProfileRequest!) {
  updateMyProfile(request: $request) {
    ...StaffFields
  }
}
    ${StaffFieldsFragmentDoc}`;
export type UpdateMyProfileMutationFn = Apollo.MutationFunction<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;

/**
 * __useUpdateMyProfileMutation__
 *
 * To run a mutation, you first call `useUpdateMyProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMyProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMyProfileMutation, { data, loading, error }] = useUpdateMyProfileMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateMyProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>(UpdateMyProfileDocument, options);
      }
export type UpdateMyProfileMutationHookResult = ReturnType<typeof useUpdateMyProfileMutation>;
export type UpdateMyProfileMutationResult = Apollo.MutationResult<UpdateMyProfileMutation>;
export type UpdateMyProfileMutationOptions = Apollo.BaseMutationOptions<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const UpdatePaymentMethodDocument = gql`
    mutation UpdatePaymentMethod($request: CreatePaymentMethodRequest!) {
  updatePaymentMethod(request: $request) {
    ...PaymentMethodsFields
  }
}
    ${PaymentMethodsFieldsFragmentDoc}`;
export type UpdatePaymentMethodMutationFn = Apollo.MutationFunction<UpdatePaymentMethodMutation, UpdatePaymentMethodMutationVariables>;

/**
 * __useUpdatePaymentMethodMutation__
 *
 * To run a mutation, you first call `useUpdatePaymentMethodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePaymentMethodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePaymentMethodMutation, { data, loading, error }] = useUpdatePaymentMethodMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdatePaymentMethodMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePaymentMethodMutation, UpdatePaymentMethodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePaymentMethodMutation, UpdatePaymentMethodMutationVariables>(UpdatePaymentMethodDocument, options);
      }
export type UpdatePaymentMethodMutationHookResult = ReturnType<typeof useUpdatePaymentMethodMutation>;
export type UpdatePaymentMethodMutationResult = Apollo.MutationResult<UpdatePaymentMethodMutation>;
export type UpdatePaymentMethodMutationOptions = Apollo.BaseMutationOptions<UpdatePaymentMethodMutation, UpdatePaymentMethodMutationVariables>;
export const UpdateRolePermissionsDocument = gql`
    mutation UpdateRolePermissions($request: RolePermissionRequest!) {
  updateRolePermissions(request: $request) {
    role
    modules
    viewOnly
  }
}
    `;
export type UpdateRolePermissionsMutationFn = Apollo.MutationFunction<UpdateRolePermissionsMutation, UpdateRolePermissionsMutationVariables>;

/**
 * __useUpdateRolePermissionsMutation__
 *
 * To run a mutation, you first call `useUpdateRolePermissionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRolePermissionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRolePermissionsMutation, { data, loading, error }] = useUpdateRolePermissionsMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateRolePermissionsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRolePermissionsMutation, UpdateRolePermissionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRolePermissionsMutation, UpdateRolePermissionsMutationVariables>(UpdateRolePermissionsDocument, options);
      }
export type UpdateRolePermissionsMutationHookResult = ReturnType<typeof useUpdateRolePermissionsMutation>;
export type UpdateRolePermissionsMutationResult = Apollo.MutationResult<UpdateRolePermissionsMutation>;
export type UpdateRolePermissionsMutationOptions = Apollo.BaseMutationOptions<UpdateRolePermissionsMutation, UpdateRolePermissionsMutationVariables>;
export const UpdateSupplierDocument = gql`
    mutation UpdateSupplier($uuid: ID!, $request: CreateSupplierRequest!) {
  updateSupplier(uuid: $uuid, request: $request) {
    ...SupplierFields
  }
}
    ${SupplierFieldsFragmentDoc}`;
export type UpdateSupplierMutationFn = Apollo.MutationFunction<UpdateSupplierMutation, UpdateSupplierMutationVariables>;

/**
 * __useUpdateSupplierMutation__
 *
 * To run a mutation, you first call `useUpdateSupplierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSupplierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSupplierMutation, { data, loading, error }] = useUpdateSupplierMutation({
 *   variables: {
 *      uuid: // value for 'uuid'
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateSupplierMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSupplierMutation, UpdateSupplierMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSupplierMutation, UpdateSupplierMutationVariables>(UpdateSupplierDocument, options);
      }
export type UpdateSupplierMutationHookResult = ReturnType<typeof useUpdateSupplierMutation>;
export type UpdateSupplierMutationResult = Apollo.MutationResult<UpdateSupplierMutation>;
export type UpdateSupplierMutationOptions = Apollo.BaseMutationOptions<UpdateSupplierMutation, UpdateSupplierMutationVariables>;
export const UpdateWorkstationDocument = gql`
    mutation UpdateWorkstation($request: CreateWorkstationRequest!) {
  updateWorkstation(request: $request) {
    ...WorkstationFields
  }
}
    ${WorkstationFieldsFragmentDoc}`;
export type UpdateWorkstationMutationFn = Apollo.MutationFunction<UpdateWorkstationMutation, UpdateWorkstationMutationVariables>;

/**
 * __useUpdateWorkstationMutation__
 *
 * To run a mutation, you first call `useUpdateWorkstationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkstationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkstationMutation, { data, loading, error }] = useUpdateWorkstationMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUpdateWorkstationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkstationMutation, UpdateWorkstationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkstationMutation, UpdateWorkstationMutationVariables>(UpdateWorkstationDocument, options);
      }
export type UpdateWorkstationMutationHookResult = ReturnType<typeof useUpdateWorkstationMutation>;
export type UpdateWorkstationMutationResult = Apollo.MutationResult<UpdateWorkstationMutation>;
export type UpdateWorkstationMutationOptions = Apollo.BaseMutationOptions<UpdateWorkstationMutation, UpdateWorkstationMutationVariables>;
export const AttendanceDocument = gql`
    query Attendance($request: DateRequest) {
  attendance(request: $request) {
    uuid
    staffUuid
    staffName
    workDate
    timeIn
    timeOut
    status
    regularHours
    overtimeHours
    notes
  }
}
    `;

/**
 * __useAttendanceQuery__
 *
 * To run a query within a React component, call `useAttendanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttendanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttendanceQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useAttendanceQuery(baseOptions?: Apollo.QueryHookOptions<AttendanceQuery, AttendanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AttendanceQuery, AttendanceQueryVariables>(AttendanceDocument, options);
      }
export function useAttendanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AttendanceQuery, AttendanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AttendanceQuery, AttendanceQueryVariables>(AttendanceDocument, options);
        }
export function useAttendanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AttendanceQuery, AttendanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AttendanceQuery, AttendanceQueryVariables>(AttendanceDocument, options);
        }
export type AttendanceQueryHookResult = ReturnType<typeof useAttendanceQuery>;
export type AttendanceLazyQueryHookResult = ReturnType<typeof useAttendanceLazyQuery>;
export type AttendanceSuspenseQueryHookResult = ReturnType<typeof useAttendanceSuspenseQuery>;
export type AttendanceQueryResult = Apollo.QueryResult<AttendanceQuery, AttendanceQueryVariables>;
export const BomDocument = gql`
    query Bom($request: IdRequest!) {
  bom(request: $request) {
    uuid
    name
    itemName
    bomItems {
      uuid
      itemName
      uomName
      qty
    }
    bomProcesses {
      uuid
      position
      processName
    }
  }
}
    `;

/**
 * __useBomQuery__
 *
 * To run a query within a React component, call `useBomQuery` and pass it any options that fit your needs.
 * When your component renders, `useBomQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBomQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useBomQuery(baseOptions: Apollo.QueryHookOptions<BomQuery, BomQueryVariables> & ({ variables: BomQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BomQuery, BomQueryVariables>(BomDocument, options);
      }
export function useBomLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BomQuery, BomQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BomQuery, BomQueryVariables>(BomDocument, options);
        }
export function useBomSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BomQuery, BomQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BomQuery, BomQueryVariables>(BomDocument, options);
        }
export type BomQueryHookResult = ReturnType<typeof useBomQuery>;
export type BomLazyQueryHookResult = ReturnType<typeof useBomLazyQuery>;
export type BomSuspenseQueryHookResult = ReturnType<typeof useBomSuspenseQuery>;
export type BomQueryResult = Apollo.QueryResult<BomQuery, BomQueryVariables>;
export const BomLevelsDocument = gql`
    query BOMLevels($request: IdRequest!) {
  bom(request: $request) {
    uuid
    code
    levels {
      level
      itemName
      itemType
      qty
      bomCode
    }
  }
}
    `;

/**
 * __useBomLevelsQuery__
 *
 * To run a query within a React component, call `useBomLevelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBomLevelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBomLevelsQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useBomLevelsQuery(baseOptions: Apollo.QueryHookOptions<BomLevelsQuery, BomLevelsQueryVariables> & ({ variables: BomLevelsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BomLevelsQuery, BomLevelsQueryVariables>(BomLevelsDocument, options);
      }
export function useBomLevelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BomLevelsQuery, BomLevelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BomLevelsQuery, BomLevelsQueryVariables>(BomLevelsDocument, options);
        }
export function useBomLevelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BomLevelsQuery, BomLevelsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BomLevelsQuery, BomLevelsQueryVariables>(BomLevelsDocument, options);
        }
export type BomLevelsQueryHookResult = ReturnType<typeof useBomLevelsQuery>;
export type BomLevelsLazyQueryHookResult = ReturnType<typeof useBomLevelsLazyQuery>;
export type BomLevelsSuspenseQueryHookResult = ReturnType<typeof useBomLevelsSuspenseQuery>;
export type BomLevelsQueryResult = Apollo.QueryResult<BomLevelsQuery, BomLevelsQueryVariables>;
export const BomsDocument = gql`
    query Boms {
  boms {
    ...BOMFields
  }
}
    ${BomFieldsFragmentDoc}`;

/**
 * __useBomsQuery__
 *
 * To run a query within a React component, call `useBomsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBomsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBomsQuery({
 *   variables: {
 *   },
 * });
 */
export function useBomsQuery(baseOptions?: Apollo.QueryHookOptions<BomsQuery, BomsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BomsQuery, BomsQueryVariables>(BomsDocument, options);
      }
export function useBomsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BomsQuery, BomsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BomsQuery, BomsQueryVariables>(BomsDocument, options);
        }
export function useBomsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BomsQuery, BomsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BomsQuery, BomsQueryVariables>(BomsDocument, options);
        }
export type BomsQueryHookResult = ReturnType<typeof useBomsQuery>;
export type BomsLazyQueryHookResult = ReturnType<typeof useBomsLazyQuery>;
export type BomsSuspenseQueryHookResult = ReturnType<typeof useBomsSuspenseQuery>;
export type BomsQueryResult = Apollo.QueryResult<BomsQuery, BomsQueryVariables>;
export const BenefitsDocument = gql`
    query Benefits {
  benefits {
    ...BenefitsFields
  }
}
    ${BenefitsFieldsFragmentDoc}`;

/**
 * __useBenefitsQuery__
 *
 * To run a query within a React component, call `useBenefitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBenefitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBenefitsQuery({
 *   variables: {
 *   },
 * });
 */
export function useBenefitsQuery(baseOptions?: Apollo.QueryHookOptions<BenefitsQuery, BenefitsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BenefitsQuery, BenefitsQueryVariables>(BenefitsDocument, options);
      }
export function useBenefitsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BenefitsQuery, BenefitsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BenefitsQuery, BenefitsQueryVariables>(BenefitsDocument, options);
        }
export function useBenefitsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BenefitsQuery, BenefitsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BenefitsQuery, BenefitsQueryVariables>(BenefitsDocument, options);
        }
export type BenefitsQueryHookResult = ReturnType<typeof useBenefitsQuery>;
export type BenefitsLazyQueryHookResult = ReturnType<typeof useBenefitsLazyQuery>;
export type BenefitsSuspenseQueryHookResult = ReturnType<typeof useBenefitsSuspenseQuery>;
export type BenefitsQueryResult = Apollo.QueryResult<BenefitsQuery, BenefitsQueryVariables>;
export const CompanyDocument = gql`
    query company {
  company {
    uuid
    name
  }
}
    `;

/**
 * __useCompanyQuery__
 *
 * To run a query within a React component, call `useCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyQuery({
 *   variables: {
 *   },
 * });
 */
export function useCompanyQuery(baseOptions?: Apollo.QueryHookOptions<CompanyQuery, CompanyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, options);
      }
export function useCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompanyQuery, CompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, options);
        }
export function useCompanySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CompanyQuery, CompanyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, options);
        }
export type CompanyQueryHookResult = ReturnType<typeof useCompanyQuery>;
export type CompanyLazyQueryHookResult = ReturnType<typeof useCompanyLazyQuery>;
export type CompanySuspenseQueryHookResult = ReturnType<typeof useCompanySuspenseQuery>;
export type CompanyQueryResult = Apollo.QueryResult<CompanyQuery, CompanyQueryVariables>;
export const ConfigurationDocument = gql`
    query Configuration {
  configuration {
    currency
    timezone
    decimalPlaces
    productionClaimMode
  }
}
    `;

/**
 * __useConfigurationQuery__
 *
 * To run a query within a React component, call `useConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useConfigurationQuery(baseOptions?: Apollo.QueryHookOptions<ConfigurationQuery, ConfigurationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConfigurationQuery, ConfigurationQueryVariables>(ConfigurationDocument, options);
      }
export function useConfigurationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConfigurationQuery, ConfigurationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConfigurationQuery, ConfigurationQueryVariables>(ConfigurationDocument, options);
        }
export function useConfigurationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ConfigurationQuery, ConfigurationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ConfigurationQuery, ConfigurationQueryVariables>(ConfigurationDocument, options);
        }
export type ConfigurationQueryHookResult = ReturnType<typeof useConfigurationQuery>;
export type ConfigurationLazyQueryHookResult = ReturnType<typeof useConfigurationLazyQuery>;
export type ConfigurationSuspenseQueryHookResult = ReturnType<typeof useConfigurationSuspenseQuery>;
export type ConfigurationQueryResult = Apollo.QueryResult<ConfigurationQuery, ConfigurationQueryVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  currentUser {
    email
    uuid
    role
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const CustomerDocument = gql`
    query Customer($request: IdRequest!) {
  customer(request: $request) {
    ...CustomerFields
  }
}
    ${CustomerFieldsFragmentDoc}`;

/**
 * __useCustomerQuery__
 *
 * To run a query within a React component, call `useCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCustomerQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCustomerQuery(baseOptions: Apollo.QueryHookOptions<CustomerQuery, CustomerQueryVariables> & ({ variables: CustomerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CustomerQuery, CustomerQueryVariables>(CustomerDocument, options);
      }
export function useCustomerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CustomerQuery, CustomerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CustomerQuery, CustomerQueryVariables>(CustomerDocument, options);
        }
export function useCustomerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CustomerQuery, CustomerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CustomerQuery, CustomerQueryVariables>(CustomerDocument, options);
        }
export type CustomerQueryHookResult = ReturnType<typeof useCustomerQuery>;
export type CustomerLazyQueryHookResult = ReturnType<typeof useCustomerLazyQuery>;
export type CustomerSuspenseQueryHookResult = ReturnType<typeof useCustomerSuspenseQuery>;
export type CustomerQueryResult = Apollo.QueryResult<CustomerQuery, CustomerQueryVariables>;
export const CustomerLedgerDocument = gql`
    query CustomerLedger($request: IdRequest!) {
  customerLedger(request: $request)
}
    `;

/**
 * __useCustomerLedgerQuery__
 *
 * To run a query within a React component, call `useCustomerLedgerQuery` and pass it any options that fit your needs.
 * When your component renders, `useCustomerLedgerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCustomerLedgerQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useCustomerLedgerQuery(baseOptions: Apollo.QueryHookOptions<CustomerLedgerQuery, CustomerLedgerQueryVariables> & ({ variables: CustomerLedgerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CustomerLedgerQuery, CustomerLedgerQueryVariables>(CustomerLedgerDocument, options);
      }
export function useCustomerLedgerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CustomerLedgerQuery, CustomerLedgerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CustomerLedgerQuery, CustomerLedgerQueryVariables>(CustomerLedgerDocument, options);
        }
export function useCustomerLedgerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CustomerLedgerQuery, CustomerLedgerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CustomerLedgerQuery, CustomerLedgerQueryVariables>(CustomerLedgerDocument, options);
        }
export type CustomerLedgerQueryHookResult = ReturnType<typeof useCustomerLedgerQuery>;
export type CustomerLedgerLazyQueryHookResult = ReturnType<typeof useCustomerLedgerLazyQuery>;
export type CustomerLedgerSuspenseQueryHookResult = ReturnType<typeof useCustomerLedgerSuspenseQuery>;
export type CustomerLedgerQueryResult = Apollo.QueryResult<CustomerLedgerQuery, CustomerLedgerQueryVariables>;
export const CustomersDocument = gql`
    query Customers {
  customers {
    ...CustomerFields
  }
}
    ${CustomerFieldsFragmentDoc}`;

/**
 * __useCustomersQuery__
 *
 * To run a query within a React component, call `useCustomersQuery` and pass it any options that fit your needs.
 * When your component renders, `useCustomersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCustomersQuery({
 *   variables: {
 *   },
 * });
 */
export function useCustomersQuery(baseOptions?: Apollo.QueryHookOptions<CustomersQuery, CustomersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CustomersQuery, CustomersQueryVariables>(CustomersDocument, options);
      }
export function useCustomersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CustomersQuery, CustomersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CustomersQuery, CustomersQueryVariables>(CustomersDocument, options);
        }
export function useCustomersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CustomersQuery, CustomersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CustomersQuery, CustomersQueryVariables>(CustomersDocument, options);
        }
export type CustomersQueryHookResult = ReturnType<typeof useCustomersQuery>;
export type CustomersLazyQueryHookResult = ReturnType<typeof useCustomersLazyQuery>;
export type CustomersSuspenseQueryHookResult = ReturnType<typeof useCustomersSuspenseQuery>;
export type CustomersQueryResult = Apollo.QueryResult<CustomersQuery, CustomersQueryVariables>;
export const DashboardDocument = gql`
    query Dashboard {
  dashboard
}
    `;

/**
 * __useDashboardQuery__
 *
 * To run a query within a React component, call `useDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useDashboardQuery(baseOptions?: Apollo.QueryHookOptions<DashboardQuery, DashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DashboardQuery, DashboardQueryVariables>(DashboardDocument, options);
      }
export function useDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DashboardQuery, DashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DashboardQuery, DashboardQueryVariables>(DashboardDocument, options);
        }
export function useDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DashboardQuery, DashboardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DashboardQuery, DashboardQueryVariables>(DashboardDocument, options);
        }
export type DashboardQueryHookResult = ReturnType<typeof useDashboardQuery>;
export type DashboardLazyQueryHookResult = ReturnType<typeof useDashboardLazyQuery>;
export type DashboardSuspenseQueryHookResult = ReturnType<typeof useDashboardSuspenseQuery>;
export type DashboardQueryResult = Apollo.QueryResult<DashboardQuery, DashboardQueryVariables>;
export const DeliveryNoteDocument = gql`
    query DeliveryNote($request: DeliveryNoteRequest!) {
  deliveryNote(request: $request) {
    ...DeliveryNoteFields
    items {
      ...DeliveryNoteItemFields
    }
  }
}
    ${DeliveryNoteFieldsFragmentDoc}
${DeliveryNoteItemFieldsFragmentDoc}`;

/**
 * __useDeliveryNoteQuery__
 *
 * To run a query within a React component, call `useDeliveryNoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeliveryNoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeliveryNoteQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useDeliveryNoteQuery(baseOptions: Apollo.QueryHookOptions<DeliveryNoteQuery, DeliveryNoteQueryVariables> & ({ variables: DeliveryNoteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeliveryNoteQuery, DeliveryNoteQueryVariables>(DeliveryNoteDocument, options);
      }
export function useDeliveryNoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeliveryNoteQuery, DeliveryNoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeliveryNoteQuery, DeliveryNoteQueryVariables>(DeliveryNoteDocument, options);
        }
export function useDeliveryNoteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DeliveryNoteQuery, DeliveryNoteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DeliveryNoteQuery, DeliveryNoteQueryVariables>(DeliveryNoteDocument, options);
        }
export type DeliveryNoteQueryHookResult = ReturnType<typeof useDeliveryNoteQuery>;
export type DeliveryNoteLazyQueryHookResult = ReturnType<typeof useDeliveryNoteLazyQuery>;
export type DeliveryNoteSuspenseQueryHookResult = ReturnType<typeof useDeliveryNoteSuspenseQuery>;
export type DeliveryNoteQueryResult = Apollo.QueryResult<DeliveryNoteQuery, DeliveryNoteQueryVariables>;
export const DeliveryNotesDocument = gql`
    query DeliveryNotes {
  deliveryNotes {
    ...DeliveryNoteFields
    warehouse {
      name
    }
  }
}
    ${DeliveryNoteFieldsFragmentDoc}`;

/**
 * __useDeliveryNotesQuery__
 *
 * To run a query within a React component, call `useDeliveryNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeliveryNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeliveryNotesQuery({
 *   variables: {
 *   },
 * });
 */
export function useDeliveryNotesQuery(baseOptions?: Apollo.QueryHookOptions<DeliveryNotesQuery, DeliveryNotesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeliveryNotesQuery, DeliveryNotesQueryVariables>(DeliveryNotesDocument, options);
      }
export function useDeliveryNotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeliveryNotesQuery, DeliveryNotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeliveryNotesQuery, DeliveryNotesQueryVariables>(DeliveryNotesDocument, options);
        }
export function useDeliveryNotesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DeliveryNotesQuery, DeliveryNotesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DeliveryNotesQuery, DeliveryNotesQueryVariables>(DeliveryNotesDocument, options);
        }
export type DeliveryNotesQueryHookResult = ReturnType<typeof useDeliveryNotesQuery>;
export type DeliveryNotesLazyQueryHookResult = ReturnType<typeof useDeliveryNotesLazyQuery>;
export type DeliveryNotesSuspenseQueryHookResult = ReturnType<typeof useDeliveryNotesSuspenseQuery>;
export type DeliveryNotesQueryResult = Apollo.QueryResult<DeliveryNotesQuery, DeliveryNotesQueryVariables>;
export const InventoryEntriesDocument = gql`
    query InventoryEntries {
  inventoryEntries {
    code
    actualQty
    type
    qtyAfterTransaction
    threadType
    item {
      ...ItemFields
    }
    warehouse {
      ...WarehouseFields
    }
    stockUomUuid
    stockUom {
      uuid
      uomName
    }
    insertedAt
    updatedAt
  }
}
    ${ItemFieldsFragmentDoc}
${WarehouseFieldsFragmentDoc}`;

/**
 * __useInventoryEntriesQuery__
 *
 * To run a query within a React component, call `useInventoryEntriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInventoryEntriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInventoryEntriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useInventoryEntriesQuery(baseOptions?: Apollo.QueryHookOptions<InventoryEntriesQuery, InventoryEntriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InventoryEntriesQuery, InventoryEntriesQueryVariables>(InventoryEntriesDocument, options);
      }
export function useInventoryEntriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InventoryEntriesQuery, InventoryEntriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InventoryEntriesQuery, InventoryEntriesQueryVariables>(InventoryEntriesDocument, options);
        }
export function useInventoryEntriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InventoryEntriesQuery, InventoryEntriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InventoryEntriesQuery, InventoryEntriesQueryVariables>(InventoryEntriesDocument, options);
        }
export type InventoryEntriesQueryHookResult = ReturnType<typeof useInventoryEntriesQuery>;
export type InventoryEntriesLazyQueryHookResult = ReturnType<typeof useInventoryEntriesLazyQuery>;
export type InventoryEntriesSuspenseQueryHookResult = ReturnType<typeof useInventoryEntriesSuspenseQuery>;
export type InventoryEntriesQueryResult = Apollo.QueryResult<InventoryEntriesQuery, InventoryEntriesQueryVariables>;
export const ItemDocument = gql`
    query Item($request: IdRequest!) {
  item(request: $request) {
    uuid
    name
    description
    sellingPrice
  }
}
    `;

/**
 * __useItemQuery__
 *
 * To run a query within a React component, call `useItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useItemQuery(baseOptions: Apollo.QueryHookOptions<ItemQuery, ItemQueryVariables> & ({ variables: ItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ItemQuery, ItemQueryVariables>(ItemDocument, options);
      }
export function useItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ItemQuery, ItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ItemQuery, ItemQueryVariables>(ItemDocument, options);
        }
export function useItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ItemQuery, ItemQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ItemQuery, ItemQueryVariables>(ItemDocument, options);
        }
export type ItemQueryHookResult = ReturnType<typeof useItemQuery>;
export type ItemLazyQueryHookResult = ReturnType<typeof useItemLazyQuery>;
export type ItemSuspenseQueryHookResult = ReturnType<typeof useItemSuspenseQuery>;
export type ItemQueryResult = Apollo.QueryResult<ItemQuery, ItemQueryVariables>;
export const ItemSupplierPricesDocument = gql`
    query ItemSupplierPrices($request: IdRequest!) {
  item(request: $request) {
    uuid
    minStockThreshold
    defaultStockUomName
    supplierPrices {
      uuid
      supplierUuid
      supplierName
      unitPrice
      updatedAt
    }
  }
}
    `;

/**
 * __useItemSupplierPricesQuery__
 *
 * To run a query within a React component, call `useItemSupplierPricesQuery` and pass it any options that fit your needs.
 * When your component renders, `useItemSupplierPricesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemSupplierPricesQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useItemSupplierPricesQuery(baseOptions: Apollo.QueryHookOptions<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables> & ({ variables: ItemSupplierPricesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables>(ItemSupplierPricesDocument, options);
      }
export function useItemSupplierPricesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables>(ItemSupplierPricesDocument, options);
        }
export function useItemSupplierPricesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables>(ItemSupplierPricesDocument, options);
        }
export type ItemSupplierPricesQueryHookResult = ReturnType<typeof useItemSupplierPricesQuery>;
export type ItemSupplierPricesLazyQueryHookResult = ReturnType<typeof useItemSupplierPricesLazyQuery>;
export type ItemSupplierPricesSuspenseQueryHookResult = ReturnType<typeof useItemSupplierPricesSuspenseQuery>;
export type ItemSupplierPricesQueryResult = Apollo.QueryResult<ItemSupplierPricesQuery, ItemSupplierPricesQueryVariables>;
export const ItemsDocument = gql`
    query Items {
  items {
    ...ItemFields
    stockUoms {
      uuid
      conversionFactor
      uomName
    }
  }
}
    ${ItemFieldsFragmentDoc}`;

/**
 * __useItemsQuery__
 *
 * To run a query within a React component, call `useItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useItemsQuery(baseOptions?: Apollo.QueryHookOptions<ItemsQuery, ItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ItemsQuery, ItemsQueryVariables>(ItemsDocument, options);
      }
export function useItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ItemsQuery, ItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ItemsQuery, ItemsQueryVariables>(ItemsDocument, options);
        }
export function useItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ItemsQuery, ItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ItemsQuery, ItemsQueryVariables>(ItemsDocument, options);
        }
export type ItemsQueryHookResult = ReturnType<typeof useItemsQuery>;
export type ItemsLazyQueryHookResult = ReturnType<typeof useItemsLazyQuery>;
export type ItemsSuspenseQueryHookResult = ReturnType<typeof useItemsSuspenseQuery>;
export type ItemsQueryResult = Apollo.QueryResult<ItemsQuery, ItemsQueryVariables>;
export const JournalEntriesDocument = gql`
    query JournalEntries {
  journalEntries {
    uuid
    entryDate
    description
    sourceType
    sourceCode
    lines {
      uuid
      account
      debit
      credit
    }
  }
  accountBalances {
    account
    debit
    credit
    balance
  }
}
    `;

/**
 * __useJournalEntriesQuery__
 *
 * To run a query within a React component, call `useJournalEntriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useJournalEntriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJournalEntriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useJournalEntriesQuery(baseOptions?: Apollo.QueryHookOptions<JournalEntriesQuery, JournalEntriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<JournalEntriesQuery, JournalEntriesQueryVariables>(JournalEntriesDocument, options);
      }
export function useJournalEntriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<JournalEntriesQuery, JournalEntriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<JournalEntriesQuery, JournalEntriesQueryVariables>(JournalEntriesDocument, options);
        }
export function useJournalEntriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<JournalEntriesQuery, JournalEntriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<JournalEntriesQuery, JournalEntriesQueryVariables>(JournalEntriesDocument, options);
        }
export type JournalEntriesQueryHookResult = ReturnType<typeof useJournalEntriesQuery>;
export type JournalEntriesLazyQueryHookResult = ReturnType<typeof useJournalEntriesLazyQuery>;
export type JournalEntriesSuspenseQueryHookResult = ReturnType<typeof useJournalEntriesSuspenseQuery>;
export type JournalEntriesQueryResult = Apollo.QueryResult<JournalEntriesQuery, JournalEntriesQueryVariables>;
export const ListStaffDocument = gql`
    query ListStaff {
  listStaff {
    ...StaffFields
  }
}
    ${StaffFieldsFragmentDoc}`;

/**
 * __useListStaffQuery__
 *
 * To run a query within a React component, call `useListStaffQuery` and pass it any options that fit your needs.
 * When your component renders, `useListStaffQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListStaffQuery({
 *   variables: {
 *   },
 * });
 */
export function useListStaffQuery(baseOptions?: Apollo.QueryHookOptions<ListStaffQuery, ListStaffQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListStaffQuery, ListStaffQueryVariables>(ListStaffDocument, options);
      }
export function useListStaffLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListStaffQuery, ListStaffQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListStaffQuery, ListStaffQueryVariables>(ListStaffDocument, options);
        }
export function useListStaffSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListStaffQuery, ListStaffQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListStaffQuery, ListStaffQueryVariables>(ListStaffDocument, options);
        }
export type ListStaffQueryHookResult = ReturnType<typeof useListStaffQuery>;
export type ListStaffLazyQueryHookResult = ReturnType<typeof useListStaffLazyQuery>;
export type ListStaffSuspenseQueryHookResult = ReturnType<typeof useListStaffSuspenseQuery>;
export type ListStaffQueryResult = Apollo.QueryResult<ListStaffQuery, ListStaffQueryVariables>;
export const ManufacturedGoodsDocument = gql`
    query ManufacturedGoods($request: DateRequest) {
  manufacturedGoods(request: $request) {
    uuid
    itemName
    qty
    workOrderCode
    storedAt
  }
}
    `;

/**
 * __useManufacturedGoodsQuery__
 *
 * To run a query within a React component, call `useManufacturedGoodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useManufacturedGoodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useManufacturedGoodsQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useManufacturedGoodsQuery(baseOptions?: Apollo.QueryHookOptions<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>(ManufacturedGoodsDocument, options);
      }
export function useManufacturedGoodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>(ManufacturedGoodsDocument, options);
        }
export function useManufacturedGoodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>(ManufacturedGoodsDocument, options);
        }
export type ManufacturedGoodsQueryHookResult = ReturnType<typeof useManufacturedGoodsQuery>;
export type ManufacturedGoodsLazyQueryHookResult = ReturnType<typeof useManufacturedGoodsLazyQuery>;
export type ManufacturedGoodsSuspenseQueryHookResult = ReturnType<typeof useManufacturedGoodsSuspenseQuery>;
export type ManufacturedGoodsQueryResult = Apollo.QueryResult<ManufacturedGoodsQuery, ManufacturedGoodsQueryVariables>;
export const MyEditModulesDocument = gql`
    query MyEditModules {
  myEditModules
}
    `;

/**
 * __useMyEditModulesQuery__
 *
 * To run a query within a React component, call `useMyEditModulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyEditModulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyEditModulesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyEditModulesQuery(baseOptions?: Apollo.QueryHookOptions<MyEditModulesQuery, MyEditModulesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyEditModulesQuery, MyEditModulesQueryVariables>(MyEditModulesDocument, options);
      }
export function useMyEditModulesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyEditModulesQuery, MyEditModulesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyEditModulesQuery, MyEditModulesQueryVariables>(MyEditModulesDocument, options);
        }
export function useMyEditModulesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyEditModulesQuery, MyEditModulesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyEditModulesQuery, MyEditModulesQueryVariables>(MyEditModulesDocument, options);
        }
export type MyEditModulesQueryHookResult = ReturnType<typeof useMyEditModulesQuery>;
export type MyEditModulesLazyQueryHookResult = ReturnType<typeof useMyEditModulesLazyQuery>;
export type MyEditModulesSuspenseQueryHookResult = ReturnType<typeof useMyEditModulesSuspenseQuery>;
export type MyEditModulesQueryResult = Apollo.QueryResult<MyEditModulesQuery, MyEditModulesQueryVariables>;
export const MyModulesDocument = gql`
    query MyModules {
  myModules
}
    `;

/**
 * __useMyModulesQuery__
 *
 * To run a query within a React component, call `useMyModulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyModulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyModulesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyModulesQuery(baseOptions?: Apollo.QueryHookOptions<MyModulesQuery, MyModulesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyModulesQuery, MyModulesQueryVariables>(MyModulesDocument, options);
      }
export function useMyModulesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyModulesQuery, MyModulesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyModulesQuery, MyModulesQueryVariables>(MyModulesDocument, options);
        }
export function useMyModulesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyModulesQuery, MyModulesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyModulesQuery, MyModulesQueryVariables>(MyModulesDocument, options);
        }
export type MyModulesQueryHookResult = ReturnType<typeof useMyModulesQuery>;
export type MyModulesLazyQueryHookResult = ReturnType<typeof useMyModulesLazyQuery>;
export type MyModulesSuspenseQueryHookResult = ReturnType<typeof useMyModulesSuspenseQuery>;
export type MyModulesQueryResult = Apollo.QueryResult<MyModulesQuery, MyModulesQueryVariables>;
export const MyProfileDocument = gql`
    query MyProfile {
  myProfile {
    ...StaffFields
  }
}
    ${StaffFieldsFragmentDoc}`;

/**
 * __useMyProfileQuery__
 *
 * To run a query within a React component, call `useMyProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyProfileQuery(baseOptions?: Apollo.QueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyProfileQuery, MyProfileQueryVariables>(MyProfileDocument, options);
      }
export function useMyProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyProfileQuery, MyProfileQueryVariables>(MyProfileDocument, options);
        }
export function useMyProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyProfileQuery, MyProfileQueryVariables>(MyProfileDocument, options);
        }
export type MyProfileQueryHookResult = ReturnType<typeof useMyProfileQuery>;
export type MyProfileLazyQueryHookResult = ReturnType<typeof useMyProfileLazyQuery>;
export type MyProfileSuspenseQueryHookResult = ReturnType<typeof useMyProfileSuspenseQuery>;
export type MyProfileQueryResult = Apollo.QueryResult<MyProfileQuery, MyProfileQueryVariables>;
export const OpenPurchaseRequestItemsDocument = gql`
    query OpenPurchaseRequestItems {
  openPurchaseRequestItems {
    ...PurchaseRequestItemFields
  }
}
    ${PurchaseRequestItemFieldsFragmentDoc}`;

/**
 * __useOpenPurchaseRequestItemsQuery__
 *
 * To run a query within a React component, call `useOpenPurchaseRequestItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpenPurchaseRequestItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpenPurchaseRequestItemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useOpenPurchaseRequestItemsQuery(baseOptions?: Apollo.QueryHookOptions<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>(OpenPurchaseRequestItemsDocument, options);
      }
export function useOpenPurchaseRequestItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>(OpenPurchaseRequestItemsDocument, options);
        }
export function useOpenPurchaseRequestItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>(OpenPurchaseRequestItemsDocument, options);
        }
export type OpenPurchaseRequestItemsQueryHookResult = ReturnType<typeof useOpenPurchaseRequestItemsQuery>;
export type OpenPurchaseRequestItemsLazyQueryHookResult = ReturnType<typeof useOpenPurchaseRequestItemsLazyQuery>;
export type OpenPurchaseRequestItemsSuspenseQueryHookResult = ReturnType<typeof useOpenPurchaseRequestItemsSuspenseQuery>;
export type OpenPurchaseRequestItemsQueryResult = Apollo.QueryResult<OpenPurchaseRequestItemsQuery, OpenPurchaseRequestItemsQueryVariables>;
export const PaymentEntriesDocument = gql`
    query PaymentEntries {
  paymentEntries {
    ...PaymentEntryFields
  }
}
    ${PaymentEntryFieldsFragmentDoc}`;

/**
 * __usePaymentEntriesQuery__
 *
 * To run a query within a React component, call `usePaymentEntriesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaymentEntriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaymentEntriesQuery({
 *   variables: {
 *   },
 * });
 */
export function usePaymentEntriesQuery(baseOptions?: Apollo.QueryHookOptions<PaymentEntriesQuery, PaymentEntriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaymentEntriesQuery, PaymentEntriesQueryVariables>(PaymentEntriesDocument, options);
      }
export function usePaymentEntriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaymentEntriesQuery, PaymentEntriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaymentEntriesQuery, PaymentEntriesQueryVariables>(PaymentEntriesDocument, options);
        }
export function usePaymentEntriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaymentEntriesQuery, PaymentEntriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaymentEntriesQuery, PaymentEntriesQueryVariables>(PaymentEntriesDocument, options);
        }
export type PaymentEntriesQueryHookResult = ReturnType<typeof usePaymentEntriesQuery>;
export type PaymentEntriesLazyQueryHookResult = ReturnType<typeof usePaymentEntriesLazyQuery>;
export type PaymentEntriesSuspenseQueryHookResult = ReturnType<typeof usePaymentEntriesSuspenseQuery>;
export type PaymentEntriesQueryResult = Apollo.QueryResult<PaymentEntriesQuery, PaymentEntriesQueryVariables>;
export const PaymentEntryDocument = gql`
    query PaymentEntry($request: IdRequest!) {
  paymentEntry(request: $request) {
    ...PaymentEntryFields
  }
}
    ${PaymentEntryFieldsFragmentDoc}`;

/**
 * __usePaymentEntryQuery__
 *
 * To run a query within a React component, call `usePaymentEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaymentEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaymentEntryQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function usePaymentEntryQuery(baseOptions: Apollo.QueryHookOptions<PaymentEntryQuery, PaymentEntryQueryVariables> & ({ variables: PaymentEntryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaymentEntryQuery, PaymentEntryQueryVariables>(PaymentEntryDocument, options);
      }
export function usePaymentEntryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaymentEntryQuery, PaymentEntryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaymentEntryQuery, PaymentEntryQueryVariables>(PaymentEntryDocument, options);
        }
export function usePaymentEntrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaymentEntryQuery, PaymentEntryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaymentEntryQuery, PaymentEntryQueryVariables>(PaymentEntryDocument, options);
        }
export type PaymentEntryQueryHookResult = ReturnType<typeof usePaymentEntryQuery>;
export type PaymentEntryLazyQueryHookResult = ReturnType<typeof usePaymentEntryLazyQuery>;
export type PaymentEntrySuspenseQueryHookResult = ReturnType<typeof usePaymentEntrySuspenseQuery>;
export type PaymentEntryQueryResult = Apollo.QueryResult<PaymentEntryQuery, PaymentEntryQueryVariables>;
export const PaymentMethodDocument = gql`
    query PaymentMethod($request: IdRequest!) {
  paymentMethod(request: $request) {
    ...PaymentMethodsFields
  }
}
    ${PaymentMethodsFieldsFragmentDoc}`;

/**
 * __usePaymentMethodQuery__
 *
 * To run a query within a React component, call `usePaymentMethodQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaymentMethodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaymentMethodQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function usePaymentMethodQuery(baseOptions: Apollo.QueryHookOptions<PaymentMethodQuery, PaymentMethodQueryVariables> & ({ variables: PaymentMethodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaymentMethodQuery, PaymentMethodQueryVariables>(PaymentMethodDocument, options);
      }
export function usePaymentMethodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaymentMethodQuery, PaymentMethodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaymentMethodQuery, PaymentMethodQueryVariables>(PaymentMethodDocument, options);
        }
export function usePaymentMethodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaymentMethodQuery, PaymentMethodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaymentMethodQuery, PaymentMethodQueryVariables>(PaymentMethodDocument, options);
        }
export type PaymentMethodQueryHookResult = ReturnType<typeof usePaymentMethodQuery>;
export type PaymentMethodLazyQueryHookResult = ReturnType<typeof usePaymentMethodLazyQuery>;
export type PaymentMethodSuspenseQueryHookResult = ReturnType<typeof usePaymentMethodSuspenseQuery>;
export type PaymentMethodQueryResult = Apollo.QueryResult<PaymentMethodQuery, PaymentMethodQueryVariables>;
export const PaymentMethodsDocument = gql`
    query PaymentMethods {
  paymentMethods {
    ...PaymentMethodsFields
  }
}
    ${PaymentMethodsFieldsFragmentDoc}`;

/**
 * __usePaymentMethodsQuery__
 *
 * To run a query within a React component, call `usePaymentMethodsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaymentMethodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaymentMethodsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePaymentMethodsQuery(baseOptions?: Apollo.QueryHookOptions<PaymentMethodsQuery, PaymentMethodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaymentMethodsQuery, PaymentMethodsQueryVariables>(PaymentMethodsDocument, options);
      }
export function usePaymentMethodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaymentMethodsQuery, PaymentMethodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaymentMethodsQuery, PaymentMethodsQueryVariables>(PaymentMethodsDocument, options);
        }
export function usePaymentMethodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaymentMethodsQuery, PaymentMethodsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaymentMethodsQuery, PaymentMethodsQueryVariables>(PaymentMethodsDocument, options);
        }
export type PaymentMethodsQueryHookResult = ReturnType<typeof usePaymentMethodsQuery>;
export type PaymentMethodsLazyQueryHookResult = ReturnType<typeof usePaymentMethodsLazyQuery>;
export type PaymentMethodsSuspenseQueryHookResult = ReturnType<typeof usePaymentMethodsSuspenseQuery>;
export type PaymentMethodsQueryResult = Apollo.QueryResult<PaymentMethodsQuery, PaymentMethodsQueryVariables>;
export const PayrollPeriodsDocument = gql`
    query PayrollPeriods {
  payrollPeriods {
    uuid
    name
    startDate
    endDate
    payDate
    status
    totalNetPay
    entries {
      ...PayrollEntryFields
    }
  }
}
    ${PayrollEntryFieldsFragmentDoc}`;

/**
 * __usePayrollPeriodsQuery__
 *
 * To run a query within a React component, call `usePayrollPeriodsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePayrollPeriodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePayrollPeriodsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePayrollPeriodsQuery(baseOptions?: Apollo.QueryHookOptions<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>(PayrollPeriodsDocument, options);
      }
export function usePayrollPeriodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>(PayrollPeriodsDocument, options);
        }
export function usePayrollPeriodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>(PayrollPeriodsDocument, options);
        }
export type PayrollPeriodsQueryHookResult = ReturnType<typeof usePayrollPeriodsQuery>;
export type PayrollPeriodsLazyQueryHookResult = ReturnType<typeof usePayrollPeriodsLazyQuery>;
export type PayrollPeriodsSuspenseQueryHookResult = ReturnType<typeof usePayrollPeriodsSuspenseQuery>;
export type PayrollPeriodsQueryResult = Apollo.QueryResult<PayrollPeriodsQuery, PayrollPeriodsQueryVariables>;
export const PayslipsDocument = gql`
    query Payslips($request: IdRequest!) {
  payslips(request: $request) {
    ...PayrollEntryFields
  }
  staffPerformance(request: $request) {
    uuid
    producedQty
    defectiveQty
    insertedAt
    workOrder {
      uuid
      code
      itemName
    }
    workOrderItem {
      uuid
      processName
    }
  }
}
    ${PayrollEntryFieldsFragmentDoc}`;

/**
 * __usePayslipsQuery__
 *
 * To run a query within a React component, call `usePayslipsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePayslipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePayslipsQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function usePayslipsQuery(baseOptions: Apollo.QueryHookOptions<PayslipsQuery, PayslipsQueryVariables> & ({ variables: PayslipsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PayslipsQuery, PayslipsQueryVariables>(PayslipsDocument, options);
      }
export function usePayslipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PayslipsQuery, PayslipsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PayslipsQuery, PayslipsQueryVariables>(PayslipsDocument, options);
        }
export function usePayslipsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PayslipsQuery, PayslipsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PayslipsQuery, PayslipsQueryVariables>(PayslipsDocument, options);
        }
export type PayslipsQueryHookResult = ReturnType<typeof usePayslipsQuery>;
export type PayslipsLazyQueryHookResult = ReturnType<typeof usePayslipsLazyQuery>;
export type PayslipsSuspenseQueryHookResult = ReturnType<typeof usePayslipsSuspenseQuery>;
export type PayslipsQueryResult = Apollo.QueryResult<PayslipsQuery, PayslipsQueryVariables>;
export const ProcessDocument = gql`
    query Process($request: IdRequest!) {
  process(request: $request) {
    uuid
  }
}
    `;

/**
 * __useProcessQuery__
 *
 * To run a query within a React component, call `useProcessQuery` and pass it any options that fit your needs.
 * When your component renders, `useProcessQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProcessQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useProcessQuery(baseOptions: Apollo.QueryHookOptions<ProcessQuery, ProcessQueryVariables> & ({ variables: ProcessQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProcessQuery, ProcessQueryVariables>(ProcessDocument, options);
      }
export function useProcessLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProcessQuery, ProcessQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProcessQuery, ProcessQueryVariables>(ProcessDocument, options);
        }
export function useProcessSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProcessQuery, ProcessQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProcessQuery, ProcessQueryVariables>(ProcessDocument, options);
        }
export type ProcessQueryHookResult = ReturnType<typeof useProcessQuery>;
export type ProcessLazyQueryHookResult = ReturnType<typeof useProcessLazyQuery>;
export type ProcessSuspenseQueryHookResult = ReturnType<typeof useProcessSuspenseQuery>;
export type ProcessQueryResult = Apollo.QueryResult<ProcessQuery, ProcessQueryVariables>;
export const ProcessesDocument = gql`
    query Processes {
  processes {
    ...ProcessFields
  }
}
    ${ProcessFieldsFragmentDoc}`;

/**
 * __useProcessesQuery__
 *
 * To run a query within a React component, call `useProcessesQuery` and pass it any options that fit your needs.
 * When your component renders, `useProcessesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProcessesQuery({
 *   variables: {
 *   },
 * });
 */
export function useProcessesQuery(baseOptions?: Apollo.QueryHookOptions<ProcessesQuery, ProcessesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProcessesQuery, ProcessesQueryVariables>(ProcessesDocument, options);
      }
export function useProcessesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProcessesQuery, ProcessesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProcessesQuery, ProcessesQueryVariables>(ProcessesDocument, options);
        }
export function useProcessesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProcessesQuery, ProcessesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProcessesQuery, ProcessesQueryVariables>(ProcessesDocument, options);
        }
export type ProcessesQueryHookResult = ReturnType<typeof useProcessesQuery>;
export type ProcessesLazyQueryHookResult = ReturnType<typeof useProcessesLazyQuery>;
export type ProcessesSuspenseQueryHookResult = ReturnType<typeof useProcessesSuspenseQuery>;
export type ProcessesQueryResult = Apollo.QueryResult<ProcessesQuery, ProcessesQueryVariables>;
export const ProductionBoardDocument = gql`
    query ProductionBoard {
  productionBoard {
    claimMode
    canSupervise
    tasks {
      uuid
      code
      itemName
      uomName
      plannedQty
      reportedQty
      goodQty
      rejectedQty
      stage
      stageChangedAt
      dueDate
      assignedStaffUuid
      assignedStaffName
      salesOrderUuid
    }
  }
}
    `;

/**
 * __useProductionBoardQuery__
 *
 * To run a query within a React component, call `useProductionBoardQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductionBoardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductionBoardQuery({
 *   variables: {
 *   },
 * });
 */
export function useProductionBoardQuery(baseOptions?: Apollo.QueryHookOptions<ProductionBoardQuery, ProductionBoardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductionBoardQuery, ProductionBoardQueryVariables>(ProductionBoardDocument, options);
      }
export function useProductionBoardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductionBoardQuery, ProductionBoardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductionBoardQuery, ProductionBoardQueryVariables>(ProductionBoardDocument, options);
        }
export function useProductionBoardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductionBoardQuery, ProductionBoardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductionBoardQuery, ProductionBoardQueryVariables>(ProductionBoardDocument, options);
        }
export type ProductionBoardQueryHookResult = ReturnType<typeof useProductionBoardQuery>;
export type ProductionBoardLazyQueryHookResult = ReturnType<typeof useProductionBoardLazyQuery>;
export type ProductionBoardSuspenseQueryHookResult = ReturnType<typeof useProductionBoardSuspenseQuery>;
export type ProductionBoardQueryResult = Apollo.QueryResult<ProductionBoardQuery, ProductionBoardQueryVariables>;
export const PurchaseInvoiceDocument = gql`
    query PurchaseInvoice($request: PurchaseInvoiceRequest!) {
  purchaseInvoice(request: $request) {
    ...PurchaseInvoiceFields
  }
}
    ${PurchaseInvoiceFieldsFragmentDoc}`;

/**
 * __usePurchaseInvoiceQuery__
 *
 * To run a query within a React component, call `usePurchaseInvoiceQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseInvoiceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseInvoiceQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function usePurchaseInvoiceQuery(baseOptions: Apollo.QueryHookOptions<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables> & ({ variables: PurchaseInvoiceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables>(PurchaseInvoiceDocument, options);
      }
export function usePurchaseInvoiceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables>(PurchaseInvoiceDocument, options);
        }
export function usePurchaseInvoiceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables>(PurchaseInvoiceDocument, options);
        }
export type PurchaseInvoiceQueryHookResult = ReturnType<typeof usePurchaseInvoiceQuery>;
export type PurchaseInvoiceLazyQueryHookResult = ReturnType<typeof usePurchaseInvoiceLazyQuery>;
export type PurchaseInvoiceSuspenseQueryHookResult = ReturnType<typeof usePurchaseInvoiceSuspenseQuery>;
export type PurchaseInvoiceQueryResult = Apollo.QueryResult<PurchaseInvoiceQuery, PurchaseInvoiceQueryVariables>;
export const PurchaseInvoicesDocument = gql`
    query PurchaseInvoices {
  purchaseInvoices {
    ...PurchaseInvoiceFields
  }
}
    ${PurchaseInvoiceFieldsFragmentDoc}`;

/**
 * __usePurchaseInvoicesQuery__
 *
 * To run a query within a React component, call `usePurchaseInvoicesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseInvoicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseInvoicesQuery({
 *   variables: {
 *   },
 * });
 */
export function usePurchaseInvoicesQuery(baseOptions?: Apollo.QueryHookOptions<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>(PurchaseInvoicesDocument, options);
      }
export function usePurchaseInvoicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>(PurchaseInvoicesDocument, options);
        }
export function usePurchaseInvoicesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>(PurchaseInvoicesDocument, options);
        }
export type PurchaseInvoicesQueryHookResult = ReturnType<typeof usePurchaseInvoicesQuery>;
export type PurchaseInvoicesLazyQueryHookResult = ReturnType<typeof usePurchaseInvoicesLazyQuery>;
export type PurchaseInvoicesSuspenseQueryHookResult = ReturnType<typeof usePurchaseInvoicesSuspenseQuery>;
export type PurchaseInvoicesQueryResult = Apollo.QueryResult<PurchaseInvoicesQuery, PurchaseInvoicesQueryVariables>;
export const PurchaseOrderDocument = gql`
    query PurchaseOrder($request: PurchaseOrderRequest!) {
  purchaseOrder(request: $request) {
    ...PurchaseOrderFields
    items {
      ...PurchaseOrderItemFields
    }
    purchaseInvoices {
      ...PurchaseInvoiceFields
    }
    receiptNotes {
      ...ReceiptNoteFields
    }
  }
}
    ${PurchaseOrderFieldsFragmentDoc}
${PurchaseOrderItemFieldsFragmentDoc}
${PurchaseInvoiceFieldsFragmentDoc}
${ReceiptNoteFieldsFragmentDoc}`;

/**
 * __usePurchaseOrderQuery__
 *
 * To run a query within a React component, call `usePurchaseOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrderQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function usePurchaseOrderQuery(baseOptions: Apollo.QueryHookOptions<PurchaseOrderQuery, PurchaseOrderQueryVariables> & ({ variables: PurchaseOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(PurchaseOrderDocument, options);
      }
export function usePurchaseOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseOrderQuery, PurchaseOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(PurchaseOrderDocument, options);
        }
export function usePurchaseOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PurchaseOrderQuery, PurchaseOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(PurchaseOrderDocument, options);
        }
export type PurchaseOrderQueryHookResult = ReturnType<typeof usePurchaseOrderQuery>;
export type PurchaseOrderLazyQueryHookResult = ReturnType<typeof usePurchaseOrderLazyQuery>;
export type PurchaseOrderSuspenseQueryHookResult = ReturnType<typeof usePurchaseOrderSuspenseQuery>;
export type PurchaseOrderQueryResult = Apollo.QueryResult<PurchaseOrderQuery, PurchaseOrderQueryVariables>;
export const PurchaseOrdersDocument = gql`
    query PurchaseOrders {
  purchaseOrders {
    ...PurchaseOrderFields
    items {
      ...PurchaseOrderItemFields
    }
  }
}
    ${PurchaseOrderFieldsFragmentDoc}
${PurchaseOrderItemFieldsFragmentDoc}`;

/**
 * __usePurchaseOrdersQuery__
 *
 * To run a query within a React component, call `usePurchaseOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function usePurchaseOrdersQuery(baseOptions?: Apollo.QueryHookOptions<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>(PurchaseOrdersDocument, options);
      }
export function usePurchaseOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>(PurchaseOrdersDocument, options);
        }
export function usePurchaseOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>(PurchaseOrdersDocument, options);
        }
export type PurchaseOrdersQueryHookResult = ReturnType<typeof usePurchaseOrdersQuery>;
export type PurchaseOrdersLazyQueryHookResult = ReturnType<typeof usePurchaseOrdersLazyQuery>;
export type PurchaseOrdersSuspenseQueryHookResult = ReturnType<typeof usePurchaseOrdersSuspenseQuery>;
export type PurchaseOrdersQueryResult = Apollo.QueryResult<PurchaseOrdersQuery, PurchaseOrdersQueryVariables>;
export const PurchaseRequestsDocument = gql`
    query PurchaseRequests {
  purchaseRequests {
    uuid
    code
    status
    requestedBy
    requiredDate
    notes
    approvedAt
    purchaseOrderCodes
    insertedAt
    items {
      ...PurchaseRequestItemFields
    }
  }
}
    ${PurchaseRequestItemFieldsFragmentDoc}`;

/**
 * __usePurchaseRequestsQuery__
 *
 * To run a query within a React component, call `usePurchaseRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePurchaseRequestsQuery(baseOptions?: Apollo.QueryHookOptions<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>(PurchaseRequestsDocument, options);
      }
export function usePurchaseRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>(PurchaseRequestsDocument, options);
        }
export function usePurchaseRequestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>(PurchaseRequestsDocument, options);
        }
export type PurchaseRequestsQueryHookResult = ReturnType<typeof usePurchaseRequestsQuery>;
export type PurchaseRequestsLazyQueryHookResult = ReturnType<typeof usePurchaseRequestsLazyQuery>;
export type PurchaseRequestsSuspenseQueryHookResult = ReturnType<typeof usePurchaseRequestsSuspenseQuery>;
export type PurchaseRequestsQueryResult = Apollo.QueryResult<PurchaseRequestsQuery, PurchaseRequestsQueryVariables>;
export const ReceiptNoteDocument = gql`
    query ReceiptNote($request: ReceiptNoteRequest!) {
  receiptNote(request: $request) {
    ...ReceiptNoteFields
    items {
      ...ReceiptNoteItemFields
    }
  }
}
    ${ReceiptNoteFieldsFragmentDoc}
${ReceiptNoteItemFieldsFragmentDoc}`;

/**
 * __useReceiptNoteQuery__
 *
 * To run a query within a React component, call `useReceiptNoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useReceiptNoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReceiptNoteQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useReceiptNoteQuery(baseOptions: Apollo.QueryHookOptions<ReceiptNoteQuery, ReceiptNoteQueryVariables> & ({ variables: ReceiptNoteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReceiptNoteQuery, ReceiptNoteQueryVariables>(ReceiptNoteDocument, options);
      }
export function useReceiptNoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReceiptNoteQuery, ReceiptNoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReceiptNoteQuery, ReceiptNoteQueryVariables>(ReceiptNoteDocument, options);
        }
export function useReceiptNoteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ReceiptNoteQuery, ReceiptNoteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ReceiptNoteQuery, ReceiptNoteQueryVariables>(ReceiptNoteDocument, options);
        }
export type ReceiptNoteQueryHookResult = ReturnType<typeof useReceiptNoteQuery>;
export type ReceiptNoteLazyQueryHookResult = ReturnType<typeof useReceiptNoteLazyQuery>;
export type ReceiptNoteSuspenseQueryHookResult = ReturnType<typeof useReceiptNoteSuspenseQuery>;
export type ReceiptNoteQueryResult = Apollo.QueryResult<ReceiptNoteQuery, ReceiptNoteQueryVariables>;
export const ReceiptNotesDocument = gql`
    query ReceiptNotes {
  receiptNotes {
    ...ReceiptNoteFields
    warehouse {
      name
    }
  }
}
    ${ReceiptNoteFieldsFragmentDoc}`;

/**
 * __useReceiptNotesQuery__
 *
 * To run a query within a React component, call `useReceiptNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useReceiptNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReceiptNotesQuery({
 *   variables: {
 *   },
 * });
 */
export function useReceiptNotesQuery(baseOptions?: Apollo.QueryHookOptions<ReceiptNotesQuery, ReceiptNotesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReceiptNotesQuery, ReceiptNotesQueryVariables>(ReceiptNotesDocument, options);
      }
export function useReceiptNotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReceiptNotesQuery, ReceiptNotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReceiptNotesQuery, ReceiptNotesQueryVariables>(ReceiptNotesDocument, options);
        }
export function useReceiptNotesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ReceiptNotesQuery, ReceiptNotesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ReceiptNotesQuery, ReceiptNotesQueryVariables>(ReceiptNotesDocument, options);
        }
export type ReceiptNotesQueryHookResult = ReturnType<typeof useReceiptNotesQuery>;
export type ReceiptNotesLazyQueryHookResult = ReturnType<typeof useReceiptNotesLazyQuery>;
export type ReceiptNotesSuspenseQueryHookResult = ReturnType<typeof useReceiptNotesSuspenseQuery>;
export type ReceiptNotesQueryResult = Apollo.QueryResult<ReceiptNotesQuery, ReceiptNotesQueryVariables>;
export const RolePermissionsDocument = gql`
    query RolePermissions {
  rolePermissions {
    role
    modules
    canLogin
    viewOnly
  }
  modules {
    key
    label
  }
}
    `;

/**
 * __useRolePermissionsQuery__
 *
 * To run a query within a React component, call `useRolePermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRolePermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRolePermissionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useRolePermissionsQuery(baseOptions?: Apollo.QueryHookOptions<RolePermissionsQuery, RolePermissionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RolePermissionsQuery, RolePermissionsQueryVariables>(RolePermissionsDocument, options);
      }
export function useRolePermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RolePermissionsQuery, RolePermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RolePermissionsQuery, RolePermissionsQueryVariables>(RolePermissionsDocument, options);
        }
export function useRolePermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RolePermissionsQuery, RolePermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RolePermissionsQuery, RolePermissionsQueryVariables>(RolePermissionsDocument, options);
        }
export type RolePermissionsQueryHookResult = ReturnType<typeof useRolePermissionsQuery>;
export type RolePermissionsLazyQueryHookResult = ReturnType<typeof useRolePermissionsLazyQuery>;
export type RolePermissionsSuspenseQueryHookResult = ReturnType<typeof useRolePermissionsSuspenseQuery>;
export type RolePermissionsQueryResult = Apollo.QueryResult<RolePermissionsQuery, RolePermissionsQueryVariables>;
export const SalesInvoiceDocument = gql`
    query SalesInvoice($request: SalesInvoiceRequest!) {
  salesInvoice(request: $request) {
    ...SalesInvoiceFields
    items {
      uuid
      itemName
      description
      uomName
      qty
      unitPrice
      discount
      lineTotal
    }
  }
}
    ${SalesInvoiceFieldsFragmentDoc}`;

/**
 * __useSalesInvoiceQuery__
 *
 * To run a query within a React component, call `useSalesInvoiceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesInvoiceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesInvoiceQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSalesInvoiceQuery(baseOptions: Apollo.QueryHookOptions<SalesInvoiceQuery, SalesInvoiceQueryVariables> & ({ variables: SalesInvoiceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesInvoiceQuery, SalesInvoiceQueryVariables>(SalesInvoiceDocument, options);
      }
export function useSalesInvoiceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesInvoiceQuery, SalesInvoiceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesInvoiceQuery, SalesInvoiceQueryVariables>(SalesInvoiceDocument, options);
        }
export function useSalesInvoiceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesInvoiceQuery, SalesInvoiceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesInvoiceQuery, SalesInvoiceQueryVariables>(SalesInvoiceDocument, options);
        }
export type SalesInvoiceQueryHookResult = ReturnType<typeof useSalesInvoiceQuery>;
export type SalesInvoiceLazyQueryHookResult = ReturnType<typeof useSalesInvoiceLazyQuery>;
export type SalesInvoiceSuspenseQueryHookResult = ReturnType<typeof useSalesInvoiceSuspenseQuery>;
export type SalesInvoiceQueryResult = Apollo.QueryResult<SalesInvoiceQuery, SalesInvoiceQueryVariables>;
export const SalesInvoicesDocument = gql`
    query SalesInvoices {
  salesInvoices {
    ...SalesInvoiceFields
  }
}
    ${SalesInvoiceFieldsFragmentDoc}`;

/**
 * __useSalesInvoicesQuery__
 *
 * To run a query within a React component, call `useSalesInvoicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesInvoicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesInvoicesQuery({
 *   variables: {
 *   },
 * });
 */
export function useSalesInvoicesQuery(baseOptions?: Apollo.QueryHookOptions<SalesInvoicesQuery, SalesInvoicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesInvoicesQuery, SalesInvoicesQueryVariables>(SalesInvoicesDocument, options);
      }
export function useSalesInvoicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesInvoicesQuery, SalesInvoicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesInvoicesQuery, SalesInvoicesQueryVariables>(SalesInvoicesDocument, options);
        }
export function useSalesInvoicesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesInvoicesQuery, SalesInvoicesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesInvoicesQuery, SalesInvoicesQueryVariables>(SalesInvoicesDocument, options);
        }
export type SalesInvoicesQueryHookResult = ReturnType<typeof useSalesInvoicesQuery>;
export type SalesInvoicesLazyQueryHookResult = ReturnType<typeof useSalesInvoicesLazyQuery>;
export type SalesInvoicesSuspenseQueryHookResult = ReturnType<typeof useSalesInvoicesSuspenseQuery>;
export type SalesInvoicesQueryResult = Apollo.QueryResult<SalesInvoicesQuery, SalesInvoicesQueryVariables>;
export const SalesOrderDocument = gql`
    query SalesOrder($request: SalesOrderRequest!) {
  salesOrder(request: $request) {
    ...SalesOrderFields
    customer {
      address
      barangay
      city
      province
      region
      postalCode
    }
    items {
      ...SalesOrderItemFields
    }
    deliveryNotes {
      ...DeliveryNoteFields
    }
    salesInvoices {
      ...SalesInvoiceFields
    }
  }
}
    ${SalesOrderFieldsFragmentDoc}
${SalesOrderItemFieldsFragmentDoc}
${DeliveryNoteFieldsFragmentDoc}
${SalesInvoiceFieldsFragmentDoc}`;

/**
 * __useSalesOrderQuery__
 *
 * To run a query within a React component, call `useSalesOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesOrderQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSalesOrderQuery(baseOptions: Apollo.QueryHookOptions<SalesOrderQuery, SalesOrderQueryVariables> & ({ variables: SalesOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesOrderQuery, SalesOrderQueryVariables>(SalesOrderDocument, options);
      }
export function useSalesOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesOrderQuery, SalesOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesOrderQuery, SalesOrderQueryVariables>(SalesOrderDocument, options);
        }
export function useSalesOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesOrderQuery, SalesOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesOrderQuery, SalesOrderQueryVariables>(SalesOrderDocument, options);
        }
export type SalesOrderQueryHookResult = ReturnType<typeof useSalesOrderQuery>;
export type SalesOrderLazyQueryHookResult = ReturnType<typeof useSalesOrderLazyQuery>;
export type SalesOrderSuspenseQueryHookResult = ReturnType<typeof useSalesOrderSuspenseQuery>;
export type SalesOrderQueryResult = Apollo.QueryResult<SalesOrderQuery, SalesOrderQueryVariables>;
export const SalesOrderWorkOrdersDocument = gql`
    query SalesOrderWorkOrders($request: SalesOrderRequest!) {
  salesOrder(request: $request) {
    uuid
    code
    requiredDate
    warehouseUuid
    workOrders {
      uuid
      code
      itemName
      plannedQty
      status
    }
    workOrderSuggestions {
      salesOrderItemUuid
      itemUuid
      itemName
      bomUuid
      bomName
      availableQty
      suggestedQty
      reason
    }
  }
}
    `;

/**
 * __useSalesOrderWorkOrdersQuery__
 *
 * To run a query within a React component, call `useSalesOrderWorkOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesOrderWorkOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesOrderWorkOrdersQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSalesOrderWorkOrdersQuery(baseOptions: Apollo.QueryHookOptions<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables> & ({ variables: SalesOrderWorkOrdersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables>(SalesOrderWorkOrdersDocument, options);
      }
export function useSalesOrderWorkOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables>(SalesOrderWorkOrdersDocument, options);
        }
export function useSalesOrderWorkOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables>(SalesOrderWorkOrdersDocument, options);
        }
export type SalesOrderWorkOrdersQueryHookResult = ReturnType<typeof useSalesOrderWorkOrdersQuery>;
export type SalesOrderWorkOrdersLazyQueryHookResult = ReturnType<typeof useSalesOrderWorkOrdersLazyQuery>;
export type SalesOrderWorkOrdersSuspenseQueryHookResult = ReturnType<typeof useSalesOrderWorkOrdersSuspenseQuery>;
export type SalesOrderWorkOrdersQueryResult = Apollo.QueryResult<SalesOrderWorkOrdersQuery, SalesOrderWorkOrdersQueryVariables>;
export const SalesOrdersDocument = gql`
    query SalesOrders {
  salesOrders {
    ...SalesOrderFields
    items {
      ...SalesOrderItemFields
    }
  }
}
    ${SalesOrderFieldsFragmentDoc}
${SalesOrderItemFieldsFragmentDoc}`;

/**
 * __useSalesOrdersQuery__
 *
 * To run a query within a React component, call `useSalesOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useSalesOrdersQuery(baseOptions?: Apollo.QueryHookOptions<SalesOrdersQuery, SalesOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesOrdersQuery, SalesOrdersQueryVariables>(SalesOrdersDocument, options);
      }
export function useSalesOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesOrdersQuery, SalesOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesOrdersQuery, SalesOrdersQueryVariables>(SalesOrdersDocument, options);
        }
export function useSalesOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesOrdersQuery, SalesOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesOrdersQuery, SalesOrdersQueryVariables>(SalesOrdersDocument, options);
        }
export type SalesOrdersQueryHookResult = ReturnType<typeof useSalesOrdersQuery>;
export type SalesOrdersLazyQueryHookResult = ReturnType<typeof useSalesOrdersLazyQuery>;
export type SalesOrdersSuspenseQueryHookResult = ReturnType<typeof useSalesOrdersSuspenseQuery>;
export type SalesOrdersQueryResult = Apollo.QueryResult<SalesOrdersQuery, SalesOrdersQueryVariables>;
export const ScheduleWorkOrderDocument = gql`
    mutation ScheduleWorkOrder($request: WorkOrderRequest!) {
  scheduleWorkOrder(request: $request) {
    status
  }
}
    `;
export type ScheduleWorkOrderMutationFn = Apollo.MutationFunction<ScheduleWorkOrderMutation, ScheduleWorkOrderMutationVariables>;

/**
 * __useScheduleWorkOrderMutation__
 *
 * To run a mutation, you first call `useScheduleWorkOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useScheduleWorkOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [scheduleWorkOrderMutation, { data, loading, error }] = useScheduleWorkOrderMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useScheduleWorkOrderMutation(baseOptions?: Apollo.MutationHookOptions<ScheduleWorkOrderMutation, ScheduleWorkOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ScheduleWorkOrderMutation, ScheduleWorkOrderMutationVariables>(ScheduleWorkOrderDocument, options);
      }
export type ScheduleWorkOrderMutationHookResult = ReturnType<typeof useScheduleWorkOrderMutation>;
export type ScheduleWorkOrderMutationResult = Apollo.MutationResult<ScheduleWorkOrderMutation>;
export type ScheduleWorkOrderMutationOptions = Apollo.BaseMutationOptions<ScheduleWorkOrderMutation, ScheduleWorkOrderMutationVariables>;
export const SupplierDocument = gql`
    query Supplier($request: IdRequest!) {
  supplier(request: $request) {
    ...SupplierFields
  }
}
    ${SupplierFieldsFragmentDoc}`;

/**
 * __useSupplierQuery__
 *
 * To run a query within a React component, call `useSupplierQuery` and pass it any options that fit your needs.
 * When your component renders, `useSupplierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSupplierQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSupplierQuery(baseOptions: Apollo.QueryHookOptions<SupplierQuery, SupplierQueryVariables> & ({ variables: SupplierQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SupplierQuery, SupplierQueryVariables>(SupplierDocument, options);
      }
export function useSupplierLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SupplierQuery, SupplierQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SupplierQuery, SupplierQueryVariables>(SupplierDocument, options);
        }
export function useSupplierSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SupplierQuery, SupplierQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SupplierQuery, SupplierQueryVariables>(SupplierDocument, options);
        }
export type SupplierQueryHookResult = ReturnType<typeof useSupplierQuery>;
export type SupplierLazyQueryHookResult = ReturnType<typeof useSupplierLazyQuery>;
export type SupplierSuspenseQueryHookResult = ReturnType<typeof useSupplierSuspenseQuery>;
export type SupplierQueryResult = Apollo.QueryResult<SupplierQuery, SupplierQueryVariables>;
export const SupplierLedgerDocument = gql`
    query SupplierLedger($request: IdRequest!) {
  supplierLedger(request: $request)
}
    `;

/**
 * __useSupplierLedgerQuery__
 *
 * To run a query within a React component, call `useSupplierLedgerQuery` and pass it any options that fit your needs.
 * When your component renders, `useSupplierLedgerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSupplierLedgerQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSupplierLedgerQuery(baseOptions: Apollo.QueryHookOptions<SupplierLedgerQuery, SupplierLedgerQueryVariables> & ({ variables: SupplierLedgerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SupplierLedgerQuery, SupplierLedgerQueryVariables>(SupplierLedgerDocument, options);
      }
export function useSupplierLedgerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SupplierLedgerQuery, SupplierLedgerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SupplierLedgerQuery, SupplierLedgerQueryVariables>(SupplierLedgerDocument, options);
        }
export function useSupplierLedgerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SupplierLedgerQuery, SupplierLedgerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SupplierLedgerQuery, SupplierLedgerQueryVariables>(SupplierLedgerDocument, options);
        }
export type SupplierLedgerQueryHookResult = ReturnType<typeof useSupplierLedgerQuery>;
export type SupplierLedgerLazyQueryHookResult = ReturnType<typeof useSupplierLedgerLazyQuery>;
export type SupplierLedgerSuspenseQueryHookResult = ReturnType<typeof useSupplierLedgerSuspenseQuery>;
export type SupplierLedgerQueryResult = Apollo.QueryResult<SupplierLedgerQuery, SupplierLedgerQueryVariables>;
export const SupplierPricesDocument = gql`
    query SupplierPrices($request: IdRequest!) {
  supplierPrices(request: $request) {
    uuid
    supplierUuid
    itemUuid
    unitPrice
  }
}
    `;

/**
 * __useSupplierPricesQuery__
 *
 * To run a query within a React component, call `useSupplierPricesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSupplierPricesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSupplierPricesQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSupplierPricesQuery(baseOptions: Apollo.QueryHookOptions<SupplierPricesQuery, SupplierPricesQueryVariables> & ({ variables: SupplierPricesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SupplierPricesQuery, SupplierPricesQueryVariables>(SupplierPricesDocument, options);
      }
export function useSupplierPricesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SupplierPricesQuery, SupplierPricesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SupplierPricesQuery, SupplierPricesQueryVariables>(SupplierPricesDocument, options);
        }
export function useSupplierPricesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SupplierPricesQuery, SupplierPricesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SupplierPricesQuery, SupplierPricesQueryVariables>(SupplierPricesDocument, options);
        }
export type SupplierPricesQueryHookResult = ReturnType<typeof useSupplierPricesQuery>;
export type SupplierPricesLazyQueryHookResult = ReturnType<typeof useSupplierPricesLazyQuery>;
export type SupplierPricesSuspenseQueryHookResult = ReturnType<typeof useSupplierPricesSuspenseQuery>;
export type SupplierPricesQueryResult = Apollo.QueryResult<SupplierPricesQuery, SupplierPricesQueryVariables>;
export const SuppliersDocument = gql`
    query Suppliers {
  suppliers {
    ...SupplierFields
  }
}
    ${SupplierFieldsFragmentDoc}`;

/**
 * __useSuppliersQuery__
 *
 * To run a query within a React component, call `useSuppliersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuppliersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuppliersQuery({
 *   variables: {
 *   },
 * });
 */
export function useSuppliersQuery(baseOptions?: Apollo.QueryHookOptions<SuppliersQuery, SuppliersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SuppliersQuery, SuppliersQueryVariables>(SuppliersDocument, options);
      }
export function useSuppliersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SuppliersQuery, SuppliersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SuppliersQuery, SuppliersQueryVariables>(SuppliersDocument, options);
        }
export function useSuppliersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SuppliersQuery, SuppliersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SuppliersQuery, SuppliersQueryVariables>(SuppliersDocument, options);
        }
export type SuppliersQueryHookResult = ReturnType<typeof useSuppliersQuery>;
export type SuppliersLazyQueryHookResult = ReturnType<typeof useSuppliersLazyQuery>;
export type SuppliersSuspenseQueryHookResult = ReturnType<typeof useSuppliersSuspenseQuery>;
export type SuppliersQueryResult = Apollo.QueryResult<SuppliersQuery, SuppliersQueryVariables>;
export const UoMsDocument = gql`
    query UOMs {
  uoms {
    ...UOMFields
  }
}
    ${UomFieldsFragmentDoc}`;

/**
 * __useUoMsQuery__
 *
 * To run a query within a React component, call `useUoMsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUoMsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUoMsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUoMsQuery(baseOptions?: Apollo.QueryHookOptions<UoMsQuery, UoMsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UoMsQuery, UoMsQueryVariables>(UoMsDocument, options);
      }
export function useUoMsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UoMsQuery, UoMsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UoMsQuery, UoMsQueryVariables>(UoMsDocument, options);
        }
export function useUoMsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UoMsQuery, UoMsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UoMsQuery, UoMsQueryVariables>(UoMsDocument, options);
        }
export type UoMsQueryHookResult = ReturnType<typeof useUoMsQuery>;
export type UoMsLazyQueryHookResult = ReturnType<typeof useUoMsLazyQuery>;
export type UoMsSuspenseQueryHookResult = ReturnType<typeof useUoMsSuspenseQuery>;
export type UoMsQueryResult = Apollo.QueryResult<UoMsQuery, UoMsQueryVariables>;
export const UnpaidPurchaseInvoicesBySupplierDocument = gql`
    query UnpaidPurchaseInvoicesBySupplier($request: IdRequest!) {
  unpaidPurchaseInvoicesBySupplier(request: $request) {
    ...PurchaseInvoiceFields
  }
}
    ${PurchaseInvoiceFieldsFragmentDoc}`;

/**
 * __useUnpaidPurchaseInvoicesBySupplierQuery__
 *
 * To run a query within a React component, call `useUnpaidPurchaseInvoicesBySupplierQuery` and pass it any options that fit your needs.
 * When your component renders, `useUnpaidPurchaseInvoicesBySupplierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUnpaidPurchaseInvoicesBySupplierQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUnpaidPurchaseInvoicesBySupplierQuery(baseOptions: Apollo.QueryHookOptions<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables> & ({ variables: UnpaidPurchaseInvoicesBySupplierQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables>(UnpaidPurchaseInvoicesBySupplierDocument, options);
      }
export function useUnpaidPurchaseInvoicesBySupplierLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables>(UnpaidPurchaseInvoicesBySupplierDocument, options);
        }
export function useUnpaidPurchaseInvoicesBySupplierSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables>(UnpaidPurchaseInvoicesBySupplierDocument, options);
        }
export type UnpaidPurchaseInvoicesBySupplierQueryHookResult = ReturnType<typeof useUnpaidPurchaseInvoicesBySupplierQuery>;
export type UnpaidPurchaseInvoicesBySupplierLazyQueryHookResult = ReturnType<typeof useUnpaidPurchaseInvoicesBySupplierLazyQuery>;
export type UnpaidPurchaseInvoicesBySupplierSuspenseQueryHookResult = ReturnType<typeof useUnpaidPurchaseInvoicesBySupplierSuspenseQuery>;
export type UnpaidPurchaseInvoicesBySupplierQueryResult = Apollo.QueryResult<UnpaidPurchaseInvoicesBySupplierQuery, UnpaidPurchaseInvoicesBySupplierQueryVariables>;
export const UnpaidSalesInvoicesByCustomerDocument = gql`
    query UnpaidSalesInvoicesByCustomer($request: IdRequest!) {
  unpaidSalesInvoicesByCustomer(request: $request) {
    ...SalesInvoiceFields
  }
}
    ${SalesInvoiceFieldsFragmentDoc}`;

/**
 * __useUnpaidSalesInvoicesByCustomerQuery__
 *
 * To run a query within a React component, call `useUnpaidSalesInvoicesByCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useUnpaidSalesInvoicesByCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUnpaidSalesInvoicesByCustomerQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useUnpaidSalesInvoicesByCustomerQuery(baseOptions: Apollo.QueryHookOptions<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables> & ({ variables: UnpaidSalesInvoicesByCustomerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables>(UnpaidSalesInvoicesByCustomerDocument, options);
      }
export function useUnpaidSalesInvoicesByCustomerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables>(UnpaidSalesInvoicesByCustomerDocument, options);
        }
export function useUnpaidSalesInvoicesByCustomerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables>(UnpaidSalesInvoicesByCustomerDocument, options);
        }
export type UnpaidSalesInvoicesByCustomerQueryHookResult = ReturnType<typeof useUnpaidSalesInvoicesByCustomerQuery>;
export type UnpaidSalesInvoicesByCustomerLazyQueryHookResult = ReturnType<typeof useUnpaidSalesInvoicesByCustomerLazyQuery>;
export type UnpaidSalesInvoicesByCustomerSuspenseQueryHookResult = ReturnType<typeof useUnpaidSalesInvoicesByCustomerSuspenseQuery>;
export type UnpaidSalesInvoicesByCustomerQueryResult = Apollo.QueryResult<UnpaidSalesInvoicesByCustomerQuery, UnpaidSalesInvoicesByCustomerQueryVariables>;
export const WarehousesDocument = gql`
    query Warehouses {
  warehouses {
    ...WarehouseFields
  }
}
    ${WarehouseFieldsFragmentDoc}`;

/**
 * __useWarehousesQuery__
 *
 * To run a query within a React component, call `useWarehousesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWarehousesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWarehousesQuery({
 *   variables: {
 *   },
 * });
 */
export function useWarehousesQuery(baseOptions?: Apollo.QueryHookOptions<WarehousesQuery, WarehousesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WarehousesQuery, WarehousesQueryVariables>(WarehousesDocument, options);
      }
export function useWarehousesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WarehousesQuery, WarehousesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WarehousesQuery, WarehousesQueryVariables>(WarehousesDocument, options);
        }
export function useWarehousesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WarehousesQuery, WarehousesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WarehousesQuery, WarehousesQueryVariables>(WarehousesDocument, options);
        }
export type WarehousesQueryHookResult = ReturnType<typeof useWarehousesQuery>;
export type WarehousesLazyQueryHookResult = ReturnType<typeof useWarehousesLazyQuery>;
export type WarehousesSuspenseQueryHookResult = ReturnType<typeof useWarehousesSuspenseQuery>;
export type WarehousesQueryResult = Apollo.QueryResult<WarehousesQuery, WarehousesQueryVariables>;
export const WorkOrderDocument = gql`
    query workOrder($request: IdRequest!) {
  workOrder(request: $request) {
    ...WorkOrderFields
    items {
      ...WorkOrderItemFields
      jobCards {
        ...JobCardFields
      }
    }
    materialRequests {
      ...MaterialRequestFields
    }
  }
}
    ${WorkOrderFieldsFragmentDoc}
${WorkOrderItemFieldsFragmentDoc}
${JobCardFieldsFragmentDoc}
${MaterialRequestFieldsFragmentDoc}`;

/**
 * __useWorkOrderQuery__
 *
 * To run a query within a React component, call `useWorkOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkOrderQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useWorkOrderQuery(baseOptions: Apollo.QueryHookOptions<WorkOrderQuery, WorkOrderQueryVariables> & ({ variables: WorkOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkOrderQuery, WorkOrderQueryVariables>(WorkOrderDocument, options);
      }
export function useWorkOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkOrderQuery, WorkOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkOrderQuery, WorkOrderQueryVariables>(WorkOrderDocument, options);
        }
export function useWorkOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkOrderQuery, WorkOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkOrderQuery, WorkOrderQueryVariables>(WorkOrderDocument, options);
        }
export type WorkOrderQueryHookResult = ReturnType<typeof useWorkOrderQuery>;
export type WorkOrderLazyQueryHookResult = ReturnType<typeof useWorkOrderLazyQuery>;
export type WorkOrderSuspenseQueryHookResult = ReturnType<typeof useWorkOrderSuspenseQuery>;
export type WorkOrderQueryResult = Apollo.QueryResult<WorkOrderQuery, WorkOrderQueryVariables>;
export const WorkOrderItemDocument = gql`
    query workOrderItem($request: IdRequest!) {
  workOrderItem(request: $request) {
    ...WorkOrderItemFields
    jobCards {
      ...JobCardFields
    }
  }
}
    ${WorkOrderItemFieldsFragmentDoc}
${JobCardFieldsFragmentDoc}`;

/**
 * __useWorkOrderItemQuery__
 *
 * To run a query within a React component, call `useWorkOrderItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkOrderItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkOrderItemQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useWorkOrderItemQuery(baseOptions: Apollo.QueryHookOptions<WorkOrderItemQuery, WorkOrderItemQueryVariables> & ({ variables: WorkOrderItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkOrderItemQuery, WorkOrderItemQueryVariables>(WorkOrderItemDocument, options);
      }
export function useWorkOrderItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkOrderItemQuery, WorkOrderItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkOrderItemQuery, WorkOrderItemQueryVariables>(WorkOrderItemDocument, options);
        }
export function useWorkOrderItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkOrderItemQuery, WorkOrderItemQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkOrderItemQuery, WorkOrderItemQueryVariables>(WorkOrderItemDocument, options);
        }
export type WorkOrderItemQueryHookResult = ReturnType<typeof useWorkOrderItemQuery>;
export type WorkOrderItemLazyQueryHookResult = ReturnType<typeof useWorkOrderItemLazyQuery>;
export type WorkOrderItemSuspenseQueryHookResult = ReturnType<typeof useWorkOrderItemSuspenseQuery>;
export type WorkOrderItemQueryResult = Apollo.QueryResult<WorkOrderItemQuery, WorkOrderItemQueryVariables>;
export const WorkOrderItemsDocument = gql`
    query WorkOrderItems {
  workOrderItems {
    ...WorkOrderItemFields
    workOrder {
      code
    }
  }
}
    ${WorkOrderItemFieldsFragmentDoc}`;

/**
 * __useWorkOrderItemsQuery__
 *
 * To run a query within a React component, call `useWorkOrderItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkOrderItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkOrderItemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useWorkOrderItemsQuery(baseOptions?: Apollo.QueryHookOptions<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>(WorkOrderItemsDocument, options);
      }
export function useWorkOrderItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>(WorkOrderItemsDocument, options);
        }
export function useWorkOrderItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>(WorkOrderItemsDocument, options);
        }
export type WorkOrderItemsQueryHookResult = ReturnType<typeof useWorkOrderItemsQuery>;
export type WorkOrderItemsLazyQueryHookResult = ReturnType<typeof useWorkOrderItemsLazyQuery>;
export type WorkOrderItemsSuspenseQueryHookResult = ReturnType<typeof useWorkOrderItemsSuspenseQuery>;
export type WorkOrderItemsQueryResult = Apollo.QueryResult<WorkOrderItemsQuery, WorkOrderItemsQueryVariables>;
export const WorkOrderStageLogsDocument = gql`
    query WorkOrderStageLogs($request: IdRequest!) {
  workOrderStageLogs(request: $request) {
    uuid
    fromStage
    toStage
    staffName
    movedBy
    reportedQty
    goodQty
    rejectedQty
    note
    insertedAt
  }
}
    `;

/**
 * __useWorkOrderStageLogsQuery__
 *
 * To run a query within a React component, call `useWorkOrderStageLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkOrderStageLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkOrderStageLogsQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useWorkOrderStageLogsQuery(baseOptions: Apollo.QueryHookOptions<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables> & ({ variables: WorkOrderStageLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables>(WorkOrderStageLogsDocument, options);
      }
export function useWorkOrderStageLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables>(WorkOrderStageLogsDocument, options);
        }
export function useWorkOrderStageLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables>(WorkOrderStageLogsDocument, options);
        }
export type WorkOrderStageLogsQueryHookResult = ReturnType<typeof useWorkOrderStageLogsQuery>;
export type WorkOrderStageLogsLazyQueryHookResult = ReturnType<typeof useWorkOrderStageLogsLazyQuery>;
export type WorkOrderStageLogsSuspenseQueryHookResult = ReturnType<typeof useWorkOrderStageLogsSuspenseQuery>;
export type WorkOrderStageLogsQueryResult = Apollo.QueryResult<WorkOrderStageLogsQuery, WorkOrderStageLogsQueryVariables>;
export const WorkOrdersDocument = gql`
    query WorkOrders {
  workOrders {
    ...WorkOrderFields
  }
}
    ${WorkOrderFieldsFragmentDoc}`;

/**
 * __useWorkOrdersQuery__
 *
 * To run a query within a React component, call `useWorkOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useWorkOrdersQuery(baseOptions?: Apollo.QueryHookOptions<WorkOrdersQuery, WorkOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkOrdersQuery, WorkOrdersQueryVariables>(WorkOrdersDocument, options);
      }
export function useWorkOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkOrdersQuery, WorkOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkOrdersQuery, WorkOrdersQueryVariables>(WorkOrdersDocument, options);
        }
export function useWorkOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkOrdersQuery, WorkOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkOrdersQuery, WorkOrdersQueryVariables>(WorkOrdersDocument, options);
        }
export type WorkOrdersQueryHookResult = ReturnType<typeof useWorkOrdersQuery>;
export type WorkOrdersLazyQueryHookResult = ReturnType<typeof useWorkOrdersLazyQuery>;
export type WorkOrdersSuspenseQueryHookResult = ReturnType<typeof useWorkOrdersSuspenseQuery>;
export type WorkOrdersQueryResult = Apollo.QueryResult<WorkOrdersQuery, WorkOrdersQueryVariables>;
export const WorkstationDocument = gql`
    query Workstation($request: IdRequest!) {
  workstation(request: $request) {
    name
  }
}
    `;

/**
 * __useWorkstationQuery__
 *
 * To run a query within a React component, call `useWorkstationQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkstationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkstationQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useWorkstationQuery(baseOptions: Apollo.QueryHookOptions<WorkstationQuery, WorkstationQueryVariables> & ({ variables: WorkstationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkstationQuery, WorkstationQueryVariables>(WorkstationDocument, options);
      }
export function useWorkstationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkstationQuery, WorkstationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkstationQuery, WorkstationQueryVariables>(WorkstationDocument, options);
        }
export function useWorkstationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkstationQuery, WorkstationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkstationQuery, WorkstationQueryVariables>(WorkstationDocument, options);
        }
export type WorkstationQueryHookResult = ReturnType<typeof useWorkstationQuery>;
export type WorkstationLazyQueryHookResult = ReturnType<typeof useWorkstationLazyQuery>;
export type WorkstationSuspenseQueryHookResult = ReturnType<typeof useWorkstationSuspenseQuery>;
export type WorkstationQueryResult = Apollo.QueryResult<WorkstationQuery, WorkstationQueryVariables>;
export const WorkstationsDocument = gql`
    query Workstations {
  workstations {
    ...WorkstationFields
  }
}
    ${WorkstationFieldsFragmentDoc}`;

/**
 * __useWorkstationsQuery__
 *
 * To run a query within a React component, call `useWorkstationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkstationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkstationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useWorkstationsQuery(baseOptions?: Apollo.QueryHookOptions<WorkstationsQuery, WorkstationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkstationsQuery, WorkstationsQueryVariables>(WorkstationsDocument, options);
      }
export function useWorkstationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkstationsQuery, WorkstationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkstationsQuery, WorkstationsQueryVariables>(WorkstationsDocument, options);
        }
export function useWorkstationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WorkstationsQuery, WorkstationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WorkstationsQuery, WorkstationsQueryVariables>(WorkstationsDocument, options);
        }
export type WorkstationsQueryHookResult = ReturnType<typeof useWorkstationsQuery>;
export type WorkstationsLazyQueryHookResult = ReturnType<typeof useWorkstationsLazyQuery>;
export type WorkstationsSuspenseQueryHookResult = ReturnType<typeof useWorkstationsSuspenseQuery>;
export type WorkstationsQueryResult = Apollo.QueryResult<WorkstationsQuery, WorkstationsQueryVariables>;

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    