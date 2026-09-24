/**
 * Status vocabularies, shared by every list screen.
 *
 * The keys are the exact values the API returns (see src/server/domain/status.ts)
 * and the UI gates actions on them — "Stock Out" only appears for `to_deliver`.
 * Keep the two files in step: a key that exists on one side only means either a
 * blank status cell or a button that never appears.
 *
 * `status` maps to Ant Design's Badge, which renders a coloured dot *and* the
 * text, so state is never conveyed by colour alone.
 */

export type StatusEnum = Record<
  string,
  {
    text: string;
    status: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error';
  }
>;

// --- Sales -----------------------------------------------------------------

export const salesOrderStatusEnum: StatusEnum = {
  draft: { text: 'Draft', status: 'Default' },
  to_deliver_and_bill: { text: 'To Deliver & Bill', status: 'Warning' },
  to_deliver: { text: 'To Deliver', status: 'Processing' },
  to_bill: { text: 'To Bill', status: 'Processing' },
  completed: { text: 'Completed', status: 'Success' },
  cancelled: { text: 'Cancelled', status: 'Default' },
};

export const salesOrderDeliveryStatusEnum: StatusEnum = {
  not_delivered: { text: 'Not Delivered', status: 'Warning' },
  partly_delivered: { text: 'Partly Delivered', status: 'Processing' },
  fully_delivered: { text: 'Delivered', status: 'Success' },
  closed: { text: 'Closed', status: 'Default' },
};

export const salesOrderBillingStatusEnum: StatusEnum = {
  not_billed: { text: 'Unpaid', status: 'Warning' },
  partly_billed: { text: 'Partly Paid', status: 'Processing' },
  fully_billed: { text: 'Paid', status: 'Success' },
  closed: { text: 'Closed', status: 'Default' },
};

// --- Purchasing ------------------------------------------------------------

export const purchaseOrderStatusEnum: StatusEnum = {
  draft: { text: 'Draft', status: 'Default' },
  to_receive_and_bill: { text: 'To Receive & Bill', status: 'Warning' },
  to_receive: { text: 'To Receive', status: 'Processing' },
  to_bill: { text: 'To Bill', status: 'Processing' },
  completed: { text: 'Completed', status: 'Success' },
  cancelled: { text: 'Cancelled', status: 'Default' },
};

export const purchaseOrderReceiptStatusEnum: StatusEnum = {
  not_received: { text: 'Not Received', status: 'Warning' },
  partly_received: { text: 'Partly Received', status: 'Processing' },
  fully_received: { text: 'Received', status: 'Success' },
  closed: { text: 'Closed', status: 'Default' },
};

export const purchaseOrderBillingStatusEnum: StatusEnum = {
  not_billed: { text: 'Unpaid', status: 'Warning' },
  partly_billed: { text: 'Partly Paid', status: 'Processing' },
  fully_billed: { text: 'Paid', status: 'Success' },
  closed: { text: 'Closed', status: 'Default' },
};

// --- Stock -----------------------------------------------------------------

export const deliveryNoteStatusEnum: StatusEnum = {
  to_deliver: { text: 'Pending Stock Out', status: 'Warning' },
  completed: { text: 'Stocked Out', status: 'Success' },
  cancelled: { text: 'Cancelled', status: 'Default' },
};

export const receiptNoteStatusEnum: StatusEnum = {
  to_receive: { text: 'Pending Stock In', status: 'Warning' },
  completed: { text: 'Stocked In', status: 'Success' },
  cancelled: { text: 'Cancelled', status: 'Default' },
};

export const inventoryEntryTypeEnum: StatusEnum = {
  opening_stock: { text: 'Opening Stock', status: 'Default' },
  receipt: { text: 'Receipt', status: 'Success' },
  delivery: { text: 'Delivery', status: 'Processing' },
  production: { text: 'Production', status: 'Success' },
  material_consumption: { text: 'Material Consumed', status: 'Warning' },
};

export const purchaseRequestStatusEnum: StatusEnum = {
  pending: { text: 'Awaiting Approval', status: 'Warning' },
  approved: { text: 'Approved', status: 'Processing' },
  partly_ordered: { text: 'Partly Ordered', status: 'Processing' },
  ordered: { text: 'Ordered', status: 'Success' },
  rejected: { text: 'Rejected', status: 'Default' },
};

export const deliveryRiskEnum: StatusEnum = {
  overdue: { text: 'Overdue', status: 'Error' },
  at_risk: { text: 'Due Soon', status: 'Warning' },
  on_track: { text: 'On Track', status: 'Success' },
};

/** Material Master classes (SRS 4.4) with their code prefixes. */
export const itemTypeEnum: Record<string, { text: string; prefix: string }> = {
  raw_material: { text: 'Raw Material', prefix: 'RM' },
  manufactured_part: { text: 'Manufactured Part', prefix: 'MP' },
  finished_good: { text: 'Finished Good', prefix: 'FG' },
};

// --- Production ------------------------------------------------------------

export const workOrderStatusEnum: StatusEnum = {
  draft: { text: 'Draft', status: 'Default' },
  scheduling: { text: 'Scheduled', status: 'Processing' },
  in_process: { text: 'In Process', status: 'Processing' },
  completed: { text: 'Completed', status: 'Success' },
  cancelled: { text: 'Cancelled', status: 'Default' },
};

export const jobCardStatusEnum: StatusEnum = {
  completed: { text: 'Completed', status: 'Success' },
  in_process: { text: 'In Process', status: 'Processing' },
};

// --- Finance ---------------------------------------------------------------

export const invoiceStatusEnum: StatusEnum = {
  unpaid: { text: 'Unpaid', status: 'Warning' },
  partly_paid: { text: 'Partly Paid', status: 'Processing' },
  paid: { text: 'Paid', status: 'Success' },
  cancelled: { text: 'Cancelled', status: 'Default' },
};

export const paymentEntryTypeEnum: StatusEnum = {
  receive: { text: 'Received', status: 'Success' },
  pay: { text: 'Paid Out', status: 'Processing' },
};

export const partyTypeEnum: StatusEnum = {
  customer: { text: 'Customer', status: 'Processing' },
  supplier: { text: 'Supplier', status: 'Default' },
};

// --- HR --------------------------------------------------------------------

export const attendanceStatusEnum: StatusEnum = {
  present: { text: 'Present', status: 'Success' },
  late: { text: 'Late', status: 'Warning' },
  absent: { text: 'Absent', status: 'Error' },
  on_leave: { text: 'On Leave', status: 'Default' },
};

export const payrollStatusEnum: StatusEnum = {
  draft: { text: 'Draft', status: 'Warning' },
  finalized: { text: 'Finalized', status: 'Success' },
};

// --- Customers -------------------------------------------------------------

/** Plain label maps, for columns that show a value rather than a status badge. */
export const customerTypeEnum: Record<string, { text: string }> = {
  individual: { text: 'Individual' },
  business: { text: 'Business' },
};

/**
 * Where a customer was first found. Ordered roughly by how the business
 * actually acquires people: marketplaces first, then social, then the rest.
 */
export const customerSourceEnum: Record<string, { text: string }> = {
  shopee: { text: 'Shopee' },
  lazada: { text: 'Lazada' },
  tiktok: { text: 'TikTok' },
  facebook_page: { text: 'Facebook Page' },
  facebook_marketplace: { text: 'Facebook Marketplace' },
  instagram: { text: 'Instagram' },
  website: { text: 'Website' },
  google: { text: 'Google Search' },
  referral: { text: 'Referral' },
  walk_in: { text: 'Walk-in' },
  direct: { text: 'Direct / Repeat' },
  other: { text: 'Other' },
};
