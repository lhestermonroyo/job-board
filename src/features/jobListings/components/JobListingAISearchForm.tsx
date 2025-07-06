'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { jobListingAISearchSchema } from '../actions/schemas';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import LoadingSwap from '@/components/LoadingSwap';
import { toast } from 'sonner';
import { getAIJobListingSearchResults } from '../actions/actions';
import { useRouter } from 'next/navigation';

export function JobListingAISearchForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(jobListingAISearchSchema),
    defaultValues: {
      query: ''
    }
  });

  async function onSubmit(data: z.infer<typeof jobListingAISearchSchema>) {
    const result = await getAIJobListingSearchResults(data);

    if (result.error) {
      toast.error(result.message);
      return;
    }

    const params = new URLSearchParams();
    result.jobIds.forEach((jobId) => {
      params.append('jobIds', jobId);
    });
    router.push(`/?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="query"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Query</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Compose search query" />
              </FormControl>
              <FormDescription>
                Provide a description of your skills/experience as well as what
                you are looking for in a job. The more specific you are, the
                better the results will be.
              </FormDescription>
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
            Search
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
