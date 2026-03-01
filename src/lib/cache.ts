import { NextResponse } from 'next/server';

interface CacheEntry {
    data: any;
    expiry: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

// Cache configuration
const DEFAULT_CACHE_TTL = 60 * 1000; // 1 minute default
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes

// Cleanup old cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (now > entry.expiry) {
            cache.delete(key);
        }
    }
}, CACHE_CLEANUP_INTERVAL);

export function getCache(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    
    return entry.data;
}

export function setCache(key: string, data: any, ttl: number = DEFAULT_CACHE_TTL): void {
    cache.set(key, {
        data,
        expiry: Date.now() + ttl
    });
}

export function invalidateCache(pattern: string): void {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
}

export function generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${JSON.stringify(params[key])}`)
        .join('&');
    return `${prefix}:${sortedParams}`;
}

// Higher-order function to wrap API handlers with caching
export function withCache(
    handler: (req: Request) => Promise<NextResponse>,
    options: {
        ttl?: number;
        keyGenerator?: (req: Request) => string;
        condition?: (req: Request) => boolean;
    } = {}
) {
    return async (request: Request): Promise<NextResponse> => {
        // Skip cache for non-GET requests by default
        if (request.method !== 'GET') {
            return handler(request);
        }

        // Check custom condition
        if (options.condition && !options.condition(request)) {
            return handler(request);
        }

        // Generate cache key
        const cacheKey = options.keyGenerator 
            ? options.keyGenerator(request)
            : generateCacheKey('api', { url: request.url });

        // Try to get from cache
        const cached = getCache(cacheKey);
        if (cached) {
            const response = NextResponse.json(cached.data, { status: cached.status });
            response.headers.set('X-Cache', 'HIT');
            return response;
        }

        // Execute handler
        const response = await handler(request);
        
        // Cache successful GET responses
        if (response.status === 200) {
            try {
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();
                setCache(cacheKey, { data, status: response.status }, options.ttl);
            } catch {
                // If response is not JSON, don't cache
            }
        }

        response.headers.set('X-Cache', 'MISS');
        return response;
    };
}
