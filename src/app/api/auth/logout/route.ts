import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, redirectUrl: '/login' }, { status: 200 });
  
  const cookiesToClear = [
    'mailos_session',
    'access_token',
    'refresh_token',
    'session_token',
    'auth_cookie'
  ];

  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire immediately
    });
  });

  return response;
}
