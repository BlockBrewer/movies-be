export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  SUPPORT: 'support',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
