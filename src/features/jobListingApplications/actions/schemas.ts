import { z } from 'zod';

export const newApplicationSchema = z.object({
  coverLetter: z
    .string()
    .transform((val) => (val.trim() === '' ? null : val))
    .nullable()
});
