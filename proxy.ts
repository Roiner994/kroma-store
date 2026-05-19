import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdminAuth } from '@/lib/firebase/admin';
import { FIREBASE_SESSION_COOKIE } from '@/lib/firebase/session';

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(FIREBASE_SESSION_COOKIE)?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isLogin = request.nextUrl.pathname === '/admin/login';
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  if (isAdmin && !isLogin && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  if (isLogin && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/productos';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
