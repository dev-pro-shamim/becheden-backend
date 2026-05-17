import { z } from 'zod';

const upsertExtraDataSchema = z.object({
  body: z
    .object({
      imageKey: z.enum(
        [
          'adImage1',
          'adImage2',
          'adImage3',
          'adImage4',
          'adImage5',
          'adImage6',
          'adImage7',
        ],
        {
          message:
            'imageKey must be one of adImage1, adImage2, adImage3, adImage4, adImage5, adImage6, adImage7',
        },
      ),
    })
    .strict(),
});

const updateExtraDataLinkSchema = z.object({
  body: z
    .object({
      linkKey: z.enum(['link1', 'link2'], {
        message: 'linkKey must be one of link1, link2',
      }),
      link: z.string().url('link must be a valid URL'),
    })
    .strict(),
});

const updateExtraDataHeadingSchema = z.object({
  body: z
    .object({
      heading: z.array(z.string()),
    })
    .strict(),
});

const updateWebsiteLogoSchema = z.object({
  body: z.object({}).strict(),
});

export const ExtraDataValidation = {
  upsertExtraDataSchema,
  updateExtraDataLinkSchema,
  updateExtraDataHeadingSchema,
  updateWebsiteLogoSchema,
};
