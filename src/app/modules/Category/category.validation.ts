import { z } from 'zod';

const createCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Category name is required!'),
      slug: z.string().min(1, 'Category slug is required!'),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const createSubCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Subcategory name is required!'),
      slug: z.string().min(1, 'Subcategory slug is required!'),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

const updateSubCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
};
