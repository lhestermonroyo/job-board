import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createdAt, updatedAt } from '@/drizzle/schemaHelpers';
import { UserTable } from './user';

export const UserNotificationSettingsTable = pgTable(
  'user_notification_settings',
  {
    userId: varchar()
      .notNull()
      .references(() => UserTable.id),
    newJobEmailNotifications: boolean().notNull().default(false),
    aiPrompt: varchar(),
    createdAt,
    updatedAt
  }
);

export const userNotificationSettingsRelations = relations(
  UserNotificationSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserNotificationSettingsTable.userId],
      references: [UserTable.id]
    })
  })
);
