'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App error]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7F7] p-6">
      <Card className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-[#062423]">Something went wrong</h1>
        <p className="text-sm text-[#547475]">
          The page could not be loaded. Please retry, or go back to your dashboard.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => { window.location.href = '/'; }}>
            Go home
          </Button>
        </div>
      </Card>
    </main>
  );
}
