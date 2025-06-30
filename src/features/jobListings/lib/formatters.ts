import {
  ExperienceLevel,
  JobListingStatus,
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

export function formatJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'delisted':
      return 'Delisted';
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
}

export function formatWage(wage: number, wageInterval: WageInterval) {
  const wageFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  });

  switch (wageInterval) {
    case 'hourly':
      return `${wageFormatter.format(wage)} per hour`;
    case 'yearly':
      return `${wageFormatter.format(wage)} per year`;
    case 'monthly':
      return `${wageFormatter.format(wage)} per month`;
    case 'weekly':
      return `${wageFormatter.format(wage)} per week`;
    case 'daily':
      return `${wageFormatter.format(wage)} per day`;
    default:
      throw new Error(`Invalid wage interval: ${wageInterval satisfies never}`);
  }
}

export function formatLocation(
  stateAbbreviation: string | null,
  city: string | null
): string {
  if (!stateAbbreviation && !city) {
    return 'None';
  }

  const locationParts: string[] = [];
  if (city) {
    locationParts.push(city);
  }
  if (stateAbbreviation) {
    locationParts.push(stateAbbreviation);
  }
  return locationParts.join(', ');
}
