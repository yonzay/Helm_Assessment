import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';

class RateLimiter {
    public static auth_limiter: RateLimitRequestHandler = rateLimit({
        windowMs: 60000 * 5,
        max: 35,
        skipSuccessfulRequests: true
    });
};

export { RateLimiter }