import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'webzio_super_secret_key_change_in_production'
)

// Explicitly public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];
const authRoutes = ['/login', '/signup', '/forgot-password'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/webhooks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('mailos_session')?.value;

  let isValidSession = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      isValidSession = true;
    } catch (e) {
      // Token is invalid/expired
      isValidSession = false;
    }
  }

  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isPublicPage = publicRoutes.includes(pathname);
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
  
  const isApiRoute = pathname.startsWith('/api/');

  // Default deny for API routes
  if (isApiRoute && !isPublicApi && !isValidSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Default deny for Page routes: if not explicitly public and no valid session, redirect to login
  if (!isApiRoute && !isPublicPage && !isValidSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth pages while already logged in, redirect to dashboard
  if (isAuthRoute && isValidSession) {
    const appUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(appUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
