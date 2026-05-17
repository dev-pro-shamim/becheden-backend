import { z } from 'zod';
import { VENDOR_STATUS } from './vendor.constant';

// const registerVendor = z.object({
//   body: z
//     .object({
//       storeName: z
//         .string({ error: 'Store name is required!' })
//         .min(1, 'Store name is required!'),
//       storeLocation: z
//         .string({ error: 'Store location is required!' })
//         .min(1, 'Store location is required!'),
//       tradeLicenseNumber: z
//         .string({ error: 'Trade license number is required!' })
//         .min(1, 'Trade license number is required!'),
//     })
//     .strict(),
// });

const updateVendor = z.object({
  body: z
    .object({
      storeName: z.string().min(1).optional(),
      storeLocation: z.string().optional(),
      tradeLicenseNumber: z.string().optional(),
      resubmitForReview: z.boolean().optional(),
    })
    .strict(),
});

const adminGetVendors = z.object({
  query: z
    .object({
      status: z
        .enum(Object.values(VENDOR_STATUS) as [string, ...string[]])
        .optional(),
      blocked: z.string().optional(),
      searchTerm: z.string().optional(),
      planId: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .partial(),
});

const approveVendor = z.object({
  body: z
    .object({
      note: z.string().optional(),
      assignedPlanId: z.string().optional(),
      planExpiresAt: z.string().datetime().optional(),
      resetListings: z.boolean().optional(),
    })
    .strict(),
});

const rejectVendor = z.object({
  body: z
    .object({
      reason: z.string().min(1, 'Rejection reason is required'),
    })
    .strict(),
});

const blockVendor = z.object({
  body: z
    .object({
      reason: z.string().optional(),
    })
    .strict(),
});

export const VendorValidation = {
  // registerVendor,
  updateVendor,
  adminGetVendors,
  approveVendor,
  rejectVendor,
  blockVendor,
};
