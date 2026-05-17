import { z } from 'zod';

const createAlertSchema = z.object({
  body: z
    .object({
      title: z
        .string({ error: 'title is required!' })
        .min(1, 'title is required!'),
      filters: z.record(z.string(), z.unknown()),
      frequency: z.enum(['INSTANT', 'DAILY', 'WEEKLY']),
    })
    .strict(),
});

const updateAlertSchema = z.object({
  body: z
    .object({
      paused: z.boolean().optional(),
      frequency: z.enum(['INSTANT', 'DAILY', 'WEEKLY']).optional(),
    })
    .strict(),
});

const createSavedSearchSchema = z.object({
  body: z.record(z.string(), z.unknown()),
});

export const AlertValidation = {
  createAlertSchema,
  updateAlertSchema,
  createSavedSearchSchema,
};
