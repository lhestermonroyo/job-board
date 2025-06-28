import {
  ExperienceLevel,
  JobListingType,
  LocationRequirement,
  WageInterval
} from '@/drizzle/schema';

export function formatWageInterval(interval: WageInterval) {
  switch (interval) {
    case 'hourly':
      return 'Hour';
    case 'yearly':
      return 'Year';
    case 'monthly':
      return 'Month';
    case 'weekly':
      return 'Week';
    case 'daily':
      return 'Day';
    default:
      throw new Error(`Invalid wage interval: ${interval satisfies never}`);
  }
}

export function formatLocationRequirement(requirement: LocationRequirement) {
  switch (requirement) {
    case 'remote':
      return 'Remote';
    case 'onsite':
      return 'Onsite';
    case 'hybrid':
      return 'Hybrid';
    default:
      throw new Error(
        `Invalid location requirement: ${requirement satisfies never}`
      );
  }
}

export function formatJobType(type: JobListingType) {
  switch (type) {
    case 'internship':
      return 'Internship';
    case 'full-time':
      return 'Full-time';
    case 'part-time':
      return 'Part-time';
    case 'contract':
      return 'Contract';
    default:
      throw new Error(`Invalid job type: ${type satisfies never}`);
  }
}

export function formatExperienceLevel(level: ExperienceLevel) {
  switch (level) {
    case 'junior':
      return 'Junior';
    case 'mid-level':
      return 'Mid-level';
    case 'senior':
      return 'Senior';
    default:
      throw new Error(`Invalid experience level: ${level satisfies never}`);
  }
}
