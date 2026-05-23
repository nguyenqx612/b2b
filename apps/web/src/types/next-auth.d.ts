import type { DefaultSession } from 'next-auth';
import type { Role } from '@b2b/shared';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      accessToken: string;
      companyName: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    accessToken: string;
    companyName: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    accessToken: string;
    companyName: string | null;
  }
}
