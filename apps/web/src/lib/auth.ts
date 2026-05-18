import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@b2b/shared';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error('[Auth] Login schema validation failed:', parsed.error);
            return null;
          }

          const apiUrl = process.env.API_URL || 'http://b2b-api-1:3001';
          console.log('[Auth] Attempting login to:', apiUrl);

          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed.data),
          });

          if (!res.ok) {
            const errorBody = await res.text();
            console.error('[Auth] API error:', res.status, errorBody);
            return null;
          }

          const { user, token } = await res.json();
          console.log('[Auth] Login successful for:', user.email);
          return { ...user, accessToken: token };
        } catch (error) {
          console.error('[Auth] authorize() exception:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.companyName = (user as any).companyName;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session.user as any).accessToken = token.accessToken;
      (session.user as any).companyName = token.companyName;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
});
