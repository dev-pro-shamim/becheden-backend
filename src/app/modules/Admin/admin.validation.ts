import { z } from 'zod';

// createAdminValidation
export const createAdminValidation = z.object({
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

    password: z
      .string({
        error: 'Password is required',
      })
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(20, { message: 'Password cannot exceed 20 characters' }),
  }),
});

// updateAdminValidation
export const updateAdminValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),

    email: z
      .string()
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      })
      .optional(),

    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(20, { message: 'Password cannot exceed 20 characters' })
      .optional(),
  }),
});

export const toggleUserBlockValidation = z.object({
  body: z
    .object({
      reason: z.string().optional(),
    })
    .strict()
    .optional(),
});

export const AdminValidation = {
  createAdminValidation,
  updateAdminValidation,
  toggleUserBlockValidation,
};
