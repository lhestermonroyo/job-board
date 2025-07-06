import { z } from 'zod';

export const organizationNotificationSchema = z.object({
  newApplicationEmailNotifications: z.boolean(),
  minimumRating: z.number().min(1).max(5).nullable()
});
