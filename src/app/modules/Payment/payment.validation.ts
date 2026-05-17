import { z } from 'zod';

const initPaymentSchema = z.object({
  body: z
    .object({
      amount: z.coerce.number().positive(),
      orderId: z.string().min(1).optional(),
    })
    .strict(),
});

const validatePaymentSchema = z.object({
  query: z
    .object({
      tran_id: z.string().min(1, 'tran_id is required!'),
    })
    .strict(),
});

export const PaymentValidation = {
  initPaymentSchema,
  validatePaymentSchema,
};
