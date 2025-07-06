import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { OrganizationUserSettingsTable } from '@/drizzle/schema';
import UserNotificationsForm from '@/features/organizations/components/UserNotificationsForm';
import { getOrganizationUserSettingsIdTag } from '@/features/organizations/db/cache/organizationUserSettings';
import {
  getCurrentOrganization,
  getCurrentUser
} from '@/services/clerk/lib/getCurrentAuth';
import { and, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default function EmployerNotificationsPage() {
  return (
    <Suspense>
      <SuspenseComponent />
    </Suspense>
  );
}

async function SuspenseComponent() {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();

  if (!userId || !orgId) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspenseForm userId={userId} organizationId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspenseForm({
  userId,
  organizationId
}: {
  userId: string;
  organizationId: string;
}) {
  const notificationSettings = await getNotificationSettings({
    userId,
    organizationId
  });

  return (
    <UserNotificationsForm
      notificationSettings={
        notificationSettings ?? {
          newApplicationEmailNotifications: false,
          minimumRating: null
        }
      }
    />
  );
}

async function getNotificationSettings({
  userId,
  organizationId
}: {
  userId: string;
  organizationId: string;
}) {
  'use cache';
  cacheTag(
    getOrganizationUserSettingsIdTag({
      userId,
      organizationId
    })
  );

  return db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, organizationId)
    ),
    columns: {
      newApplicationEmailNotifications: true,
      minimumRating: true
    }
  });
}
