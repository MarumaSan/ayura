import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute for general APIs
const AUTH_RATE_LIMIT_MAX = 5; // 5 requests per minute for auth endpoints

export function rateLimit(
    identifier: string,
    isAuthEndpoint: boolean = false
): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const maxRequests = isAuthEndpoint ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX;
    
    const entry = rateLimitMap.get(identifier);
    
    if (!entry || now > entry.resetTime) {
        // Create new entry
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        };
        rateLimitMap.set(identifier, newEntry);
        
        // Clean up old entries periodically
        if (rateLimitMap.size > 1000) {
            for (const [key, value] of rateLimitMap.entries()) {
                if (now > value.resetTime) {
                    rateLimitMap.delete(key);
                }
            }
        }
        
        return {
            success: true,
            limit: maxRequests,
            remaining: maxRequests - 1,
            reset: newEntry.resetTime
        };
    }
    
    // Increment count
    entry.count++;
    
    return {
        success: entry.count <= maxRequests,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - entry.count),
        reset: entry.resetTime
    };
}

export function getRateLimitIdentifier(request: NextRequest): string {
    // Use IP address or forwarded IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown';
    return ip;
}

export function withRateLimit(
    handler: (req: NextRequest) => Promise<NextResponse>,
    isAuthEndpoint: boolean = false
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const identifier = getRateLimitIdentifier(request);
        const rateLimitResult = rateLimit(identifier, isAuthEndpoint);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { 
                    error: 'Too many requests', 
                    message: isAuthEndpoint 
                        ? 'กรุณารอสักครู่ก่อนลองใหม่อีกครั้ง' 
                        : 'กรุณาลดการใช้งานและลองใหม่ในภายหลัง'
                },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(rateLimitResult.limit),
                        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                        'X-RateLimit-Reset': String(rateLimitResult.reset)
                    }
                }
            );
        }
        
        const response = await handler(request);
        
        // Add rate limit headers to response
        response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimitResult.reset));
        
        return response;
    };
}
