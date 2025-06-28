import { db } from '@/drizzle/db';
import { UserTable } from '@/drizzle/schema';
import { getOrganizationIdTag } from '@/features/organizations/db/cache/organization';
import { getUserIdTag } from '@/features/users/db/cache/users';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

// user
export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId !== null ? await getUser(userId) : undefined
  };
}

async function getUser(id: string) {
  'use cache';
  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id)
  });
}

// organization
export async function getCurrentOrganization({ allData = false } = {}) {
  const { orgId } = await auth();

  return {
    orgId,
    organization:
      allData && typeof orgId === 'string'
        ? await getOrganization(orgId)
        : undefined
  };
}

async function getOrganization(id: string) {
  'use cache';
  cacheTag(getOrganizationIdTag(id));

  return db.query.OrganizationTable.findFirst({
    where: eq(UserTable.id, id)
  });
}
