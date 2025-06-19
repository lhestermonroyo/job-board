import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createdAt, id, updatedAt } from '@/drizzle/schemaHelpers';
import { OrganizationTable } from './organization';
import { JobListingApplicationTable } from './jobListingApplication';

export const wageIntervals = [
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly'
] as const;
type WageInterval = (typeof wageIntervals)[number];

export const wageIntervalEnum = pgEnum(
  'job_listing_wage_interval',
  wageIntervals
);

export const locationRequirements = ['remote', 'onsite', 'hybrid'] as const;
type LocationRequirement = (typeof locationRequirements)[number];

export const locationRequirementEnum = pgEnum(
  'job_listing_location_requirement',
  locationRequirements
);

export const experienceLevels = ['junior', 'mid-level', 'senior'] as const;
type ExperienceLevel = (typeof experienceLevels)[number];

export const experienceLevelEnum = pgEnum(
  'job_listing_experience_level',
  experienceLevels
);

export const jobListingStatuses = ['draft', 'published', 'delisted'] as const;
type JobListingStatus = (typeof jobListingStatuses)[number];
export const jobListingStatusEnum = pgEnum(
  'job_listing_status',
  jobListingStatuses
);

export const jobListingTypes = [
  'internship',
  'full-time',
  'part-time',
  'contract'
] as const;
type JobListingType = (typeof jobListingTypes)[number];
export const jobListingTypeEnum = pgEnum('job_listing_type', jobListingTypes);

export const JobListingTable = pgTable(
  'job_listings',
  {
    id,
    organizationId: varchar()
      .references(() => OrganizationTable.id, {
        onDelete: 'cascade'
      })
      .notNull(),
    title: varchar().notNull(),
    description: text().notNull(),
    wage: integer(),
    wageInterval: wageIntervalEnum(),
    stateAbbreviation: varchar(),
    city: varchar(),
    isFeatured: boolean().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    status: jobListingStatusEnum().notNull().default('draft'),
    type: jobListingTypeEnum().notNull(),
    postedAt: timestamp({
      withTimezone: true
    }),
    createdAt,
    updatedAt
  },
  (table) => [index().on(table.stateAbbreviation)]
);

export const jobListingRelations = relations(
  JobListingTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [JobListingTable.organizationId],
      references: [OrganizationTable.id]
    }),
    applications: many(JobListingApplicationTable)
  })
);
