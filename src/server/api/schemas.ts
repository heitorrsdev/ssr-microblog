import { z } from 'zod';

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const idParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const handleParams = z.object({
  handle: z.string().regex(/^[a-z0-9_]{2,20}$/),
});
