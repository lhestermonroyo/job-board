import { ReactNode, Suspense } from 'react';

type Props = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};

export function AsyncIf({
  condition,
  children,
  loadingFallback,
  otherwise
}: Props) {
  return (
    <Suspense fallback={loadingFallback}>
      <SuspenseComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspenseComponent>
    </Suspense>
  );
}

async function SuspenseComponent({
  children,
  condition,
  otherwise
}: Omit<Props, 'loadingFallback'>) {
  return (await condition()) ? children : otherwise;
}
