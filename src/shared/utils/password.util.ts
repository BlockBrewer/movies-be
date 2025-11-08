import { hash } from 'bcryptjs';

export async function hashPassword(raw: string): Promise<string> {
  return hash(raw, 10);
}
