import { NextRequest, NextResponse, NextMiddleware } from 'next/server';
import { jwtVerify } from 'jose';

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const token = req.cookies.get('otAuthToken');

  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  try {
    await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Middleware error: ${error.message}`);
    }
    return NextResponse.redirect(new URL('/auth', req.url));
  }
};

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|fonts|favicon.ico|api/login|api/register).*)'],
};
