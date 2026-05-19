import { cookies } from 'next/headers';
import { firebaseAdminAuth } from '@/lib/firebase/admin';
import { FIREBASE_SESSION_COOKIE } from '@/lib/firebase/session';

export async function requireAdminSession(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  const decoded = await firebaseAdminAuth.verifySessionCookie(token, true);
  return decoded.uid;
}
