import type { Role } from '../constants/roles.js';

export interface UserPublic {
  id: string;
  email: string;
  role: Role;
  companyName: string | null;
  createdAt: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
