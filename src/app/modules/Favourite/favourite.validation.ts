import { z } from 'zod';

const listMyFavouritesSchema = z.object({
  query: z
    .object({
      category: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .partial(),
});

export const FavouriteValidation = {
  listMyFavouritesSchema,
};
