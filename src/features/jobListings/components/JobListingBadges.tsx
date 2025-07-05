import { ComponentProps, Fragment } from 'react';
import { cn } from '@/lib/utils';
import { JobListingTable } from '@/drizzle/schema';
import { Badge } from '@/components/ui/badge';
import {
  BanknoteIcon,
  BuildingIcon,
  GraduationCapIcon,
  HourglassIcon,
  MapPinIcon
} from 'lucide-react';
import {
  formatExperienceLevel,
  formatJobType,
  formatLocation,
  formatLocationRequirement,
  formatWage
} from '../lib/formatters';

export function JobListingBadges({
  jobListing: {
    wage,
    wageInterval,
    stateAbbreviation,
    city,
    type,
    experienceLevel,
    locationRequirement,
    isFeatured
  },
  className
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | 'wage'
    | 'wageInterval'
    | 'stateAbbreviation'
    | 'city'
    | 'type'
    | 'experienceLevel'
    | 'locationRequirement'
    | 'isFeatured'
  >;
  className?: string;
}) {
  const badgeProps = {
    variant: 'outline',
    className
  } satisfies ComponentProps<typeof Badge>;

  return (
    <Fragment>
      {isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            className,
            'border-featured bg-featured/50 text-featured-foreground'
          )}
        >
          Featured
        </Badge>
      )}

      {wage && wageInterval && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}

      {stateAbbreviation && city && (
        <Badge {...badgeProps}>
          <MapPinIcon />
          {formatLocation(stateAbbreviation, city)}
        </Badge>
      )}

      <Badge {...badgeProps}>
        <BuildingIcon />
        {formatLocationRequirement(locationRequirement)}
      </Badge>

      <Badge {...badgeProps}>
        <HourglassIcon />
        {formatJobType(type)}
      </Badge>

      <Badge {...badgeProps}>
        <GraduationCapIcon />
        {formatExperienceLevel(experienceLevel)}
      </Badge>
    </Fragment>
  );
}
