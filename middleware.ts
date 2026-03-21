import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env';

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookieValues: CookieToSet[]) {
        cookieValues.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookieValues.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const isAuthPage = pathname.startsWith('/auth');
  const isPublicAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico';

  if (isPublicAsset) {
    return response;
  }

  if (data.user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!data.user && isLoginPage === false && isAuthPage === false) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
