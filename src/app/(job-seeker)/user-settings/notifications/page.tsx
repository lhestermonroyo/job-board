import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { UserNotificationSettingsTable } from '@/drizzle/schema';
import UserNotificationsForm from '@/features/users/components/UserNotificationsForm';
import { getUserNotificationSettingsIdTag } from '@/features/users/db/cache/userNotificationSettings';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default function UserNotificationsPage() {
  return (
    <Suspense>
      <SuspenseComponent />
    </Suspense>
  );
}

async function SuspenseComponent() {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspenseForm userId={userId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspenseForm({ userId }: { userId: string }) {
  const notificationSettings = await getNotificationSettings(userId);

  if (!notificationSettings) {
    // You can render a fallback UI or handle this case as needed
    return <div>No notification settings found.</div>;
  }

  return <UserNotificationsForm notificationSettings={notificationSettings} />;
}

async function getNotificationSettings(userId: string) {
  'use cache';
  cacheTag(getUserNotificationSettingsIdTag(userId));

  return db.query.UserNotificationSettingsTable.findFirst({
    where: eq(UserNotificationSettingsTable.userId, userId),
    columns: {
      newJobEmailNotifications: true,
      aiPrompt: true
    }
  });
}
