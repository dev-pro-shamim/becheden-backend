import { z } from 'zod';

const buyPlanSchema = z.object({
  body: z
    .object({
      planId: z.string().min(1, 'planId is required!'),
      billingCycle: z.string().optional(),
    })
    .strict(),
});

const createPlanSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'name is required!'),
      price: z.coerce.number(),
      currency: z.string().optional(),
      durationUnit: z.string().optional(),
      durationValue: z.coerce.number().optional(),
      adsLimit: z.coerce.number().optional(),
      features: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const updatePlanSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      price: z.coerce.number().optional(),
      currency: z.string().optional(),
      durationUnit: z.string().optional(),
      durationValue: z.coerce.number().optional(),
      adsLimit: z.coerce.number().optional(),
      features: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const walletTopupSchema = z.object({
  body: z
    .object({
      amount: z.coerce.number().positive().optional(),
      method: z.string().optional(),
    })
    .strict(),
});

const verifyPaymentSchema = z.object({
  query: z
    .object({
      tran_id: z.string().min(1, 'tran_id is required!'),
    })
    .strict(),
});

export const SubscriptionValidation = {
  buyPlanSchema,
  verifyPaymentSchema,
  createPlanSchema,
  updatePlanSchema,
  walletTopupSchema,
};
