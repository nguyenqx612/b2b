import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
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

          const apiUrl = process.env.API_URL ?? 'http://api:3001';

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
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.companyName = user.companyName;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as JWT;
      session.user.id = t.id;
      session.user.role = t.role;
      session.user.accessToken = t.accessToken;
      session.user.companyName = t.companyName ?? null;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
});
