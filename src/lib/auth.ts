import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import prisma from './db';

const secretKey = process.env.JWT_SECRET || 'webzio_super_secret_key_change_in_production';
const encodedKey = new TextEncoder().encode(secretKey);

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifyToken(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function requireRole(userId: string, workspaceId: string, allowedRoles: string[]) {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      }
    }
  });

  if (!member) return false;
  return allowedRoles.includes(member.role);
}
