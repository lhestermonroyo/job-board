'use client';

import { UserNotificationSettingsTable } from '@/drizzle/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { userNotificationSchema } from '../actions/schemas';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import LoadingSwap from '@/components/LoadingSwap';
import { toast } from 'sonner';
import { updateUserNotificationSettings } from '../actions/userNotificationSettingsActions';

export default function UserNotificationsForm({
  notificationSettings
}: {
  notificationSettings: Pick<
    typeof UserNotificationSettingsTable.$inferSelect,
    'newJobEmailNotifications' | 'aiPrompt'
  >;
}) {
  const form = useForm({
    resolver: zodResolver(userNotificationSchema),
    defaultValues: notificationSettings ?? {
      newJobEmailNotifications: false,
      aiPrompt: ''
    }
  });

  async function onSubmit(data: z.infer<typeof userNotificationSchema>) {
    const result = await updateUserNotificationSettings(data);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  }

  const newJobEmailNotifications = form.watch('newJobEmailNotifications');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm space-y-6">
          <FormField
            name="newJobEmailNotifications"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Daily Email Notifications</FormLabel>
                    <FormDescription>
                      Receive emails about new job postings that match your
                      interests.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          {newJobEmailNotifications && (
            <FormField
              name="aiPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-0.5">
                    <FormLabel>Filter Prompt</FormLabel>
                    <FormDescription>
                      Our AI will use this prompt to filter job postings and
                      only send you notifications for jobs that match your
                      criteria.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      className="min-h-32"
                      placeholder="Describe the type of jobs you want to receive notifications for, e.g., 'I'm looking for remote software engineering positions with a focus on React and Node.js. Please exclude any roles that require more than 5 years of experience or are not related to web development.'
                    "
                    />
                  </FormControl>

                  <FormDescription>
                    Leave blank to receive notifications for all new job
                    postings.
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
        </div>
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Settings
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
