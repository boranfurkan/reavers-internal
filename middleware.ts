import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

const apiRateLimitCache = new LRUCache<
  string,
  { count: number; reset: number }
>({
  max: 100000, // Limit the number of IP addresses to store
  ttl: 10000, // TTL (time to live) in ms, 10 seconds
});

const imageRateLimitCache = new LRUCache<
  string,
  { count: number; reset: number }
>({
  max: 100000,
  ttl: 60000, // TTL (time to live) in ms, 60 seconds
});

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip ?? '127.0.0.1';
};

const rateLimit = (
  cache: LRUCache<string, { count: number; reset: number }>,
  ip: string,
  limit: number,
  resetTime: number,
): { success: boolean; remaining: number; reset: number } => {
  const now = Date.now();
  const entry = cache.get(ip);

  if (!entry || entry.reset < now) {
    // Reset the rate limit if the time has passed
    cache.set(ip, { count: 1, reset: now + resetTime });
    return { success: true, remaining: limit - 1, reset: resetTime / 1000 };
  }

  if (entry.count < limit) {
    // Increment the count and return success
    entry.count += 1;
    cache.set(ip, entry);
    return {
      success: true,
      remaining: limit - entry.count,
      reset: (entry.reset - now) / 1000,
    };
  }

  // Rate limit exceeded
  return { success: false, remaining: 0, reset: (entry.reset - now) / 1000 };
};

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response | undefined> {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;

  let rateLimitResult;
  let cacheControl;

  if (path.startsWith('/api')) {
    // the rate limit here 10 requests per 10 seconds
    rateLimitResult = rateLimit(apiRateLimitCache, ip, 10, 10000);
    cacheControl = 'no-store, max-age=0';
  } else if (isPublicMedia(path)) {
    rateLimitResult = rateLimit(imageRateLimitCache, ip, 1000, 60000);
    cacheControl = 'public, max-age=2592000, s-maxage=31536000, immutable';
  } else {
    return NextResponse.next();
  }

  const res = rateLimitResult.success
    ? NextResponse.next()
    : NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, statusText: 'Too Many Requests' },
      );

  // Set rate limit headers
  res.headers.set('X-RateLimit-Limit', rateLimitResult.success ? '1000' : '10');
  res.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  res.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

  if (!rateLimitResult.success) {
    res.headers.set('Cache-Control', 'no-store, max-age=0');
  } else {
    res.headers.set('Cache-Control', cacheControl);
  }

  return res;
}

function isPublicMedia(path: string): boolean {
  const mediaExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.mp4',
  ];
  return mediaExtensions.some((ext) => path.toLowerCase().endsWith(ext));
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/(.*).jpg',
    '/(.*).jpeg',
    '/(.*).png',
    '/(.*).gif',
    '/(.*).webp',
    '/(.*).svg',
    '/(.*).mp4',
  ],
};
