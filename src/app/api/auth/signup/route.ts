import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user and a default workspace
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: `${firstName} ${lastName}`.trim(),
        workspaces: {
          create: {
            role: 'OWNER',
            workspace: {
              create: {
                name: 'My Workspace',
              }
            }
          }
        }
      },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        }
      }
    });

    const workspaceId = user.workspaces[0].workspaceId;

    // Create JWT
    const token = await signToken({ userId: user.id, workspaceId, email: user.email });

    const response = NextResponse.redirect(new URL('/dashboard', request.url), 303);
    response.cookies.set('mailos_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
