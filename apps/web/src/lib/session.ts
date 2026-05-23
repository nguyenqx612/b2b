import { auth } from '@/lib/auth';

export async function getSessionToken(): Promise<string> {
  const session = await auth();
  if (!session?.user?.accessToken) {
    throw new Error('Unauthenticated');
  }
  return session.user.accessToken;
}

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthenticated');
  }
  return session.user;
}
