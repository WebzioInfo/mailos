import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePasswords, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    let email, password;
    
    // Support both FormData and JSON
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { workspaces: true }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Use the first workspace as default
    const workspaceId = user.workspaces[0]?.workspaceId || '';

    // Create JWT
    const token = await signToken({ userId: user.id, workspaceId, email: user.email });

    const response = NextResponse.json({ success: true, redirectUrl: '/dashboard' }, { status: 200 });
    
    response.cookies.set('mailos_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
