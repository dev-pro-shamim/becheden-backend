import { z } from 'zod';
// import { PageTypes, TPageTypes } from './page.constant';

const createOrUpdatePageSchema = z.object({
  body: z.object({
    // type: z
    //   .enum(Object.values(PageTypes) as [TPageTypes, ...TPageTypes[]], {
    //     error: 'Type is required',
    //   })
    //   .refine((val) => Object.values(PageTypes).includes(val), {
    //     message: `Type must be one of: ${Object.values(PageTypes)
    //       .map((v) => `'${v}'`)
    //       .join(', ')}.`,
    //   }),

    type: z.string().min(1, 'Type is required'),

    title: z.string().min(3, 'Title must be at least 3 characters long'),

    content: z.string().min(10, 'Content must be at least 10 characters long'),
  }),
});

export const pageZodValidation = {
  createOrUpdatePageSchema,
};
