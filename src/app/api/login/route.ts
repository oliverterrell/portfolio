import bcrypt from 'bcrypt';
import { serialize } from 'cookie';
import { SignJWT } from 'jose';
import { NextRequest } from 'next/server';
import { UserService } from '@/server/UserService';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await UserService.findOneBy('email', email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const issuedAt = Math.floor(Date.now() / 1000);
      const expiresAt = issuedAt + 60 * 60 * 24 * 14;

      const token = await new SignJWT({ userId: user.id })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(expiresAt)
        .setIssuedAt(issuedAt)
        .setNotBefore(issuedAt)
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      const serializedAuthTokenSessionCookie = serialize('otAuthToken', token, {
        httpOnly: false,
        secure: true,
        path: '/',
      });

      const headers = new Headers();
      headers.append('Set-Cookie', serializedAuthTokenSessionCookie);

      return Response.json({ message: 'Login successful' }, { status: 200, headers: headers });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid login credentials' }), { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Unspecified error occurred.' }), { status: 500 });
  }
}
