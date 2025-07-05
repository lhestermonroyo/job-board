'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ExperienceLevel,
  experienceLevels,
  JobListingType,
  jobListingTypes,
  LocationRequirement,
  locationRequirements
} from '@/drizzle/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement
} from '../lib/formatters';
import StateSelectItem from './StateSelectItem';
import { Button } from '@/components/ui/button';
import LoadingSwap from '@/components/LoadingSwap';
import { useSidebar } from '@/components/ui/sidebar';

const ANY_VALUE = 'any';

const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  stateAbbreviation: z.string().or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional()
});

export function JobListingFilterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get('title') ?? '',
      city: searchParams.get('city') ?? '',
      stateAbbreviation: searchParams.get('stateAbbreviation') ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get('experienceLevel') as ExperienceLevel) ?? ANY_VALUE,
      type: (searchParams.get('type') as JobListingType) ?? ANY_VALUE,
      locationRequirement:
        (searchParams.get('locationRequirement') as LocationRequirement) ??
        ANY_VALUE
    }
  });

  function onSubmit(data: z.infer<typeof jobListingFilterSchema>) {
    const newParams = new URLSearchParams();

    if (data.title) {
      newParams.set('title', data.title);
    }

    if (data.city) {
      newParams.set('city', data.city);
    }

    if (data.stateAbbreviation && data.stateAbbreviation !== ANY_VALUE) {
      newParams.set('stateAbbreviation', data.stateAbbreviation);
    }

    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE) {
      newParams.set('experienceLevel', data.experienceLevel);
    }

    if (data.type && data.type !== ANY_VALUE) {
      newParams.set('type', data.type);
    }

    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE) {
      newParams.set('locationRequirement', data.locationRequirement);
    }

    router.push(`${pathname}/?${newParams.toString()}`);
    setOpenMobile(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter job title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="locationRequirement"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Requirement</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value ?? ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Enter state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {locationRequirements.map((requirement) => (
                    <SelectItem key={requirement} value={requirement}>
                      {formatLocationRequirement(requirement)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Enter city"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="stateAbbreviation"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Enter state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  <StateSelectItem />
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value ?? ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Enter job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {jobListingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value ?? ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Enter experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {formatExperienceLevel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Filter
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
