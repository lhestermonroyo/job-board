'use server';

import { z } from 'zod';
import { userNotificationSchema } from './schemas';
import { updateUserNotificationSettings as updateUserNotificationSettingsDb } from '../db/userNotificationSettings';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';

export async function updateUserNotificationSettings(
  unsafeData: z.infer<typeof userNotificationSchema>
) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return { error: true, message: 'User not authenticated.' };
  }

  const { success, data } = userNotificationSchema.safeParse(unsafeData);
  if (!success) {
    return { error: true, message: 'Invalid data provided.' };
  }

  await updateUserNotificationSettingsDb(userId, data);

  return {
    error: false,
    message: 'Notification settings updated successfully!'
  };
}
