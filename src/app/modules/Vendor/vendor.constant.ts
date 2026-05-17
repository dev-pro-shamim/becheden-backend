export const VENDOR_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type TVendorStatus = (typeof VENDOR_STATUS)[keyof typeof VENDOR_STATUS];
