import { NextRequest, NextResponse } from 'next/server';
import { FIREBASE_SESSION_COOKIE } from '@/lib/firebase/session';

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(FIREBASE_SESSION_COOKIE)?.value;
  const isLogin = request.nextUrl.pathname === '/admin/login';
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  // Presence check only — full verify happens in API/server routes.
  // Avoid loading firebase-admin in proxy (was blocking auth redirects).
  const hasSession = Boolean(sessionCookie);

  if (isAdmin && !isLogin && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  if (isLogin && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/productos';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
