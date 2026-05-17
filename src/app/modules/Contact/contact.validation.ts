import { z } from 'zod';

// createContactValidation
export const createContactValidation = z.object({
  body: z.object({
    name: z.string({
      error: 'Name is required',
    }),

    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    phone: z.string({
      error: 'Phone is required',
    }),

    subject: z
      .string({
        error: 'Subject is required',
      })
      .min(3, { message: 'Subject must be at least 3 characters long' }),

    message: z
      .string({
        error: 'Message is required',
      })
      .min(20, { message: 'Message must be at least 20 characters long' }),
  }),
});

// sendEmailValidation
const sendEmailValidation = z.object({
  body: z.object({
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' })
      .transform((email) => email.toLowerCase())
      .refine((email) => email !== '', { message: 'Email is required!' })
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!',
      }),

    subject: z
      .string({
        error: 'Subject is required',
      })
      .min(3, { message: 'Subject must be at least 3 characters long' }),

    message: z
      .string({
        error: 'Message is required',
      })
      .min(3, { message: 'Message must be at least 3 characters long' }),
  }),
});

export const ContactValidation = {
  createContactValidation,
  sendEmailValidation,
};
