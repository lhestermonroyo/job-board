import { useEffect, useState } from 'react';

export function useIsDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false; // Default to light mode on server-side rendering
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const controller = new AbortController();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      (e) => {
        setIsDarkMode(e.matches);
      },
      {
        signal: controller.signal
      }
    );

    return () => {
      controller.abort();
    };
  }, []);

  return isDarkMode;
}
