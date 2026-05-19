import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdminAuth } from '@/lib/firebase/admin';
import { FIREBASE_SESSION_COOKIE } from '@/lib/firebase/session';

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(FIREBASE_SESSION_COOKIE, sessionCookie, {
      maxAge: SESSION_MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to create Firebase session cookie', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(FIREBASE_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
