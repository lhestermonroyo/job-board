'use server';

import { z } from 'zod';
import { organizationNotificationSchema } from './schemas';
import {
  getCurrentOrganization,
  getCurrentUser
} from '@/services/clerk/lib/getCurrentAuth';
import { updateOrganizationUserSettings as updateOrganizationUserSettingsDb } from '@/features/organizations/db/organizationUserSettings';

export async function updateOrganizationNotificationSettings(
  unsafeData: z.infer<typeof organizationNotificationSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();

  if (!userId || !orgId) {
    return {
      error: true,
      message: 'User or organization not found.'
    };
  }

  const { success, data } =
    organizationNotificationSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid data provided.'
    };
  }

  await updateOrganizationUserSettingsDb(
    {
      userId,
      organizationId: orgId
    },
    data
  );

  return {
    error: false,
    message: 'Notification settings updated successfully.'
  };
}
