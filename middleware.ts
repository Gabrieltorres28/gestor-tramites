import { NextResponse, type NextRequest } from 'next/server';

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}

function hasSupabaseSessionCookie(request: NextRequest) {
  const cookies = request.cookies?.getAll?.() ?? [];

  return cookies.some((cookie) => {
    const name = cookie?.name ?? '';
    return name.startsWith('sb-') && name.includes('auth-token');
  });
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl?.pathname ?? '/';

  console.log('[middleware] enter', {
    pathname,
    method: request.method,
  });

  try {
    if (isPublicPath(pathname)) {
      console.log('[middleware] public path, skipping', { pathname });
      return NextResponse.next();
    }

    const isLoginPage = pathname === '/login';
    const isAuthPage = pathname.startsWith('/auth');
    const hasSession = hasSupabaseSessionCookie(request);
    const cookieNames = (request.cookies?.getAll?.() ?? []).map((cookie) => cookie?.name ?? '');

    console.log('[middleware] cookies read', {
      pathname,
      hasSession,
      cookieNames,
    });

    if (isLoginPage || isAuthPage) {
      console.log('[middleware] auth path, allowing request', {
        pathname,
        hasSession,
      });

      return NextResponse.next();
    }

    if (!hasSession) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.search = '';

      console.log('[middleware] redirect unauthenticated user to login', {
        from: pathname,
        to: redirectUrl.toString(),
      });

      return NextResponse.redirect(redirectUrl);
    }

    console.log('[middleware] allow request', {
      pathname,
      hasSession,
    });

    return NextResponse.next();
  } catch (error) {
    console.error('[middleware] crash', {
      pathname,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });

    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
