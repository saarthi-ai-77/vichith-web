import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Refresh Supabase Session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            request.cookies.delete({ name, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.delete({ name, ...options });
          },
        },
      }
    );

    // This refreshes the session dynamically if expired
    await supabase.auth.getUser();
  }

  // 2. Subdomain Rewrite Logic
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Bypass Next.js internal system directories, standard API routes, and files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(.*)$/)
  ) {
    return response;
  }

  // Detect app.vichith.com (prod) or app.localhost / local host headers
  const isAppSubdomain = hostname.startsWith('app.') || hostname.startsWith('app-');

  if (isAppSubdomain) {
    // Rewrite app.* path requests internally to /platform/*
    url.pathname = `/platform${pathname}`;
    const rewrittenResponse = NextResponse.rewrite(url, {
      request: {
        headers: request.headers,
      },
    });

    // Copy any set-cookie headers so the client persists session updates
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        rewrittenResponse.headers.append(key, value);
      }
    });

    return rewrittenResponse;
  }

  return response;
}

export const config = {
  matcher: [
    // Apply middleware to all routes except system files, static bundles, and images
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
