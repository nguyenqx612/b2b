'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function isAuthError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes('unauthenticated') || msg.includes('deactivated') || msg.includes('invalid credentials');
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const authError = isAuthError(error);

  useEffect(() => {
    console.error('[App error]', error);
    if (authError) {
      void signOut({ callbackUrl: '/auth/login' });
    }
  }, [error, authError]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-lg">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            {authError
              ? 'Your session is no longer valid. Signing you out…'
              : 'The page could not be loaded. Please try again.'}
          </p>
          {!authError && (
            <div className="flex justify-center gap-3">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
