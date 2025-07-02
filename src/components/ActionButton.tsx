'use client';

import { ComponentPropsWithRef, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog';
import LoadingSwap from './LoadingSwap';

type ActionButtonProps = Omit<
  ComponentPropsWithRef<typeof Button>,
  'onClick'
> & {
  action: () => Promise<{ error: boolean; message?: string }>;
  requiredConfirm?: boolean;
  confirmDescription?: string;
};

export function ActionButton({
  action,
  requiredConfirm = false,
  confirmDescription = 'This action cannot be undone',
  ...props
}: ActionButtonProps) {
  const [isLoading, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      const result = await action();

      if (result.error) {
        toast.error(
          result.message ?? 'An error occurred while performing the action.'
        );
      }
    });
  }

  if (requiredConfirm) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              <LoadingSwap isLoading={isLoading}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button {...props} disabled={isLoading} onClick={performAction}>
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  );
}
