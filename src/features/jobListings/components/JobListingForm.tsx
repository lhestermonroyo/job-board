'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  wageIntervals
} from '@/drizzle/schema';
import { jobListingSchema } from './actions/schemas';
import { createJobListing, updateJobListing } from './actions/actions';
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatWageInterval
} from '../lib/formatters';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import StateSelectItem from './StateSelectItem';
import LoadingSwap from '@/components/LoadingSwap';

export default function JobListingForm({
  jobListing
}: {
  jobListing?: Pick<
    typeof JobListingTable.$inferSelect,
    | 'id'
    | 'title'
    | 'wage'
    | 'wageInterval'
    | 'city'
    | 'stateAbbreviation'
    | 'type'
    | 'experienceLevel'
    | 'locationRequirement'
    | 'description'
  >;
}) {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: jobListing ?? {
      title: '',
      wage: null,
      wageInterval: 'yearly',
      city: null,
      stateAbbreviation: null,
      type: 'full-time',
      experienceLevel: 'junior',
      locationRequirement: 'onsite',
      description: ''
    }
  });

  async function onSubmit(data: z.infer<typeof jobListingSchema>) {
    const action = jobListing
      ? updateJobListing.bind(null, jobListing.id)
      : createJobListing;
    const res = await action(data);

    if (res.error) {
      toast.error(res.message);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 @container"
      >
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
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
            name="wage"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wage</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter wage"
                      type="number"
                      value={field.value ?? ''}
                      className="rounded-r-none"
                      onChange={(e) =>
                        field.onChange(
                          isNaN(e.target.valueAsNumber)
                            ? null
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormField
                    name="wageInterval"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value ?? ''}
                        >
                          <SelectTrigger className="rounded-l-none">
                            / <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {wageIntervals.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {formatWageInterval(interval)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormDescription>This field is optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
          <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
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
                      <StateSelectItem />
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
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
        </div>

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <MarkdownEditor
                  {...field}
                  markdown={field.value ?? ''}
                  placeholder="Enter job description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            {jobListing ? 'Update Job Listing' : 'Create Job Listing'}
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
