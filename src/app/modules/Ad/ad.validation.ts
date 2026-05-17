import { z } from 'zod';

const createAdSchema = z.object({
  body: z
    .object({
      categoryId: z
        .string({ error: 'Category is required!' })
        .min(1, 'Category is required!'),

      // subCategoryId: z
      //   .string({ error: 'Subcategory is required!' })
      //   .min(1, 'Subcategory is required!'),

      condition: z.enum(['used', 'new'], {
        message: 'Condition must be one of "used" or "new"!',
      }),

      title: z.string({ error: 'Title is required!' }),
      // .min(15, 'Title must be at least 15 characters long!')
      // .max(80, 'Title must be at most 80 characters long!'),

      description: z.string({ error: 'Description is required!' }),
      // .min(300, 'Description must be at least 300 characters long!')
      // .max(1200, 'Description must be at most 1200 characters long!'),

      price: z.coerce.number({ error: 'Price is required!' }),

      negotiable: z.coerce.boolean(),

      location: z.string({ error: 'Location is required!' }),
      // .min(3, 'Location (district name) must be at least 3 characters long!')
      // .max(50, 'Location must be at most 50 characters long!'),

      contactName: z
        .string({ error: 'Contact Name is required!' })
        .min(3, 'Contact Name must be at least 3 characters long!'),

      contactPhone: z
        .string({ error: 'Contact Phone is required!' })
        .min(1, 'Contact Phone is required!'),

      contactEmail: z
        .string({ error: 'Contact Email is required!' })
        .email('Invalid Contact Email format!'),
    })
    .strict(),
});

const updateAdSchema = z.object({
  body: z
    .object({
      categoryId: z.string().min(1, 'Category is required!').optional(),

      // subCategoryId: z.string().min(1, 'Subcategory is required!').optional(),

      condition: z
        .enum(['used', 'new'], {
          message: 'Condition must be one of "used" or "new"!',
        })
        .optional(),

      title: z
        .string()
        .min(15, 'Title must be at least 15 characters long!')
        .max(80, 'Title must be at most 80 characters long!')
        .optional(),

      description: z
        .string()
        .min(300, 'Description must be at least 300 characters long!')
        .max(1200, 'Description must be at most 1200 characters long!')
        .optional(),

      price: z.coerce.number().optional(),

      negotiable: z.coerce.boolean().optional(),

      location: z
        .string()
        .min(3, 'Location (district name) must be at least 3 characters long!')
        .max(50, 'Location must be at most 50 characters long!')
        .optional(),

      contactName: z
        .string()
        .min(3, 'Contact Name must be at least 3 characters long!')
        .optional(),

      contactPhone: z.string().min(1, 'Contact Phone is required!').optional(),

      contactEmail: z
        .string()
        .email('Invalid Contact Email format!')
        .optional(),
    })
    .strict(),
});

// const approveAdSchema = z.object({
//   body: z
//     .object({
//       note: z
//         .string()
//         .min(15, 'Note must be at least 15 characters long!')
//         .max(200, 'Note must be at most 200 characters long!')
//         .optional(),
//     })
//     .strict()
//     .optional(),
// });

const rejectAdSchema = z.object({
  body: z
    .object({
      reason: z
        .string({ error: 'Reason is required!' })
        .min(10, 'Reason must be at least 10 characters long!')
        .max(200, 'Reason must be at most 200 characters long!'),

      note: z
        .string()
        .min(15, 'Note must be at least 15 characters long!')
        .max(200, 'Note must be at most 200 characters long!')
        .optional(),
    })
    .strict(),
});

const boostAdSchema = z.object({
  body: z
    .object({
      type: z.enum(['FEATURED', 'URGENT'], {
        message: 'Type must be either "FEATURED" or "URGENT"!',
      }),
      durationDays: z.coerce.number().int().positive(),
    })
    .strict(),
});

const reportAdSchema = z.object({
  body: z
    .object({
      reason: z
        .string({ error: 'Reason is required!' })
        .min(3, 'Reason must be at least 3 characters long!')
        .max(100, 'Reason must be at most 100 characters long!'),

      details: z
        .string()
        .min(15, 'Details must be at least 15 characters long!')
        .max(200, 'Details must be at most 200 characters long!')
        .optional(),
    })
    .strict(),
});

export const AdValidation = {
  createAdSchema,
  updateAdSchema,
  // approveAdSchema,
  rejectAdSchema,
  boostAdSchema,
  reportAdSchema,
};
