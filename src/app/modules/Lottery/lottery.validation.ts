import { z } from 'zod';

const listLotteriesSchema = z.object({
  query: z
    .object({
      status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .partial(),
});

const joinLotterySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'id is required!'),
  }),
  body: z
    .object({
      quantity: z.coerce.number().int().positive().optional(),
    })
    .strict(),
});

const redeemRewardSchema = z.object({
  body: z
    .object({
      rewardId: z.string().min(1, 'rewardId is required!'),
      quantity: z.coerce.number().int().positive().optional(),
    })
    .strict(),
});

const createLotterySchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title is required!').trim(),
      description: z.string().min(1, 'Description is required!').trim(),

      drawDate: z
        .string()
        .datetime({ message: 'Invalid date format! Use ISO string.' }),

      ticketPrice: z.coerce
        .number({ error: 'Ticket price is required!' })
        .positive('Price must be positive'),

      prize: z.string().min(1, 'Prize is required!'),
    })
    .strict(),
});

export type CreateLotteryInput = z.infer<typeof createLotterySchema>;

const updateLotterySchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title is required!').trim().optional(),
      description: z
        .string()
        .min(1, 'Description is required!')
        .trim()
        .optional(),

      drawDate: z
        .string()
        .datetime({ message: 'Invalid date format! Use ISO string.' })
        .optional(),

      ticketPrice: z.coerce
        .number()
        .positive('Price must be positive')
        .optional(),

      prize: z.string().min(1, 'Prize is required!').optional(),
      status: z.string().min(1, 'status is required!').optional(),
    })
    .strict(),
});

const updateLotteryStatusSchema = z.object({
  body: z
    .object({
      status: z.string().min(1, 'status is required!'),
    })
    .strict(),
});

export const LotteryValidation = {
  listLotteriesSchema,
  joinLotterySchema,
  redeemRewardSchema,
  createLotterySchema,
  updateLotterySchema,
  updateLotteryStatusSchema,
};
