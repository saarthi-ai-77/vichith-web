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
            request.cookies.set({ name, value, ...options, domain: '.vichith.in' });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options, domain: '.vichith.in' });
          },
          remove(name: string, options: any) {
            request.cookies.delete({ name, ...options, domain: '.vichith.in' });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.delete({ name, ...options, domain: '.vichith.in' });
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

  // 2. CORS Logic for API routes
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin') || '';
    // Allow app subdomains for cross-origin requests
    if (origin && (origin.includes('app.vichith.in') || origin.includes('localhost'))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-razorpay-signature');
    }

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return response;
    }
  }

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
