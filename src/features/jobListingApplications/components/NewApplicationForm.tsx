'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { newApplicationSchema } from '../actions/schemas';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { Button } from '@/components/ui/button';
import LoadingSwap from '@/components/LoadingSwap';
import { toast } from 'sonner';
import { createJobListingApplication } from '../actions/actions';

export default function NewApplicationForm({
  jobListingId
}: {
  jobListingId: string;
}) {
  const form = useForm({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: {
      coverLetter: ''
    }
  });

  async function onSubmit(data: z.infer<typeof newApplicationSchema>) {
    const results = await createJobListingApplication(jobListingId, data);

    if (results.error) {
      toast.error(results.message);
    }

    toast.success(results.message);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="coverLetter"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <MarkdownEditor
                  {...field}
                  markdown={field.value ?? ''}
                  placeholder="Compose cover letter"
                />
              </FormControl>
              <FormDescription>This field is optional</FormDescription>
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
            Submit Application
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
