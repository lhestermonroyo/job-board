import { db } from '@/drizzle/db';
import { UserNotificationSettingsTable } from '@/drizzle/schema';
import { revalidateUserNotificationSettingsCache } from './cache/userNotificationSettings';
import { eq } from 'drizzle-orm';

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();

  revalidateUserNotificationSettingsCache(settings.userId);
}

export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<
    Omit<typeof UserNotificationSettingsTable.$inferInsert, 'userId'>
  >
) {
  // await db
  //   .insert(UserNotificationSettingsTable)
  //   .values({ ...settings, userId })
  //   .onConflictDoUpdate({
  //     target: UserNotificationSettingsTable.userId,
  //     set: settings
  //   });
  await db
    .update(UserNotificationSettingsTable)
    .set(settings)
    .where(eq(UserNotificationSettingsTable.userId, userId));

  revalidateUserNotificationSettingsCache(userId);
}
