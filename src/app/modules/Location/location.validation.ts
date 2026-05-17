import { z } from 'zod';

const createLocationSchema = z.object({
  body: z
    .object({
      division: z.string().min(1, 'Division is required!'),
      area: z.string().min(1, 'Area is required!'),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const updateLocationSchema = z.object({
  body: z
    .object({
      division: z.string().min(1).optional(),
      area: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const listLocationSchema = z.object({
  query: z
    .object({
      division: z.string().optional(),
      searchTerm: z.string().optional(),
    })
    .partial(),
});

export const LocationValidation = {
  createLocationSchema,
  updateLocationSchema,
  listLocationSchema,
};
