import { Suspense } from 'react';
import { RegisterForm } from './RegisterForm';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
