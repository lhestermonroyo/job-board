import { z } from 'zod';

export const userNotificationSchema = z.object({
  newJobEmailNotifications: z.boolean(),
  aiPrompt: z
    .string()
    .transform((val) => (val.trim() === '' ? null : val))
    .nullable()
});
