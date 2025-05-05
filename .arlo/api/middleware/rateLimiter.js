/**
 * Rate Limiter Middleware
 * Prevents abuse of the API by limiting request frequency
 */

// In-memory storage for rate limiting
// In production, would use Redis or another distributed store
const requestCounts = new Map();

// Clear old entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  for (const [key, data] of requestCounts.entries()) {
    if (data.timestamp < oneHourAgo) {
      requestCounts.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Rate limiting middleware for API endpoints
 *
 * @param {Object} options - Rate limit options
 * @param {number} options.limit - Maximum requests per window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.keyGenerator - Function to generate keys (default is IP-based)
 * @param {string} options.message - Message to return on limit exceeded
 * @return {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    limit = 100, // 100 requests per window by default
    windowMs = 15 * 60 * 1000, // 15 minutes by default
    keyGenerator = (req) =>
      req.ip || req.headers["x-forwarded-for"] || "unknown",
    message = "Too many requests, please try again later",
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create record
    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 0,
        timestamp: now,
        resetTime: now + windowMs,
      });
    }

    const record = requestCounts.get(key);

    // Reset counter if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.timestamp = now;
      record.resetTime = now + windowMs;
    }

    // Increment counter
    record.count += 1;

    // Check if over limit
    if (record.count > limit) {
      return res.status(429).json({
        success: false,
        error: {
          type: "RATE_LIMIT_EXCEEDED",
          message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
      });
    }

    // Add headers
    res.set("X-RateLimit-Limit", limit);
    res.set("X-RateLimit-Remaining", Math.max(0, limit - record.count));
    res.set("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    next();
  };
}

/**
 * AI provider rate limiter - stricter limits for AI endpoints
 * These are more expensive operations
 */
const aiProviderRateLimiter = createRateLimiter({
  limit: 50, // 50 requests per window
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: "Too many AI requests, please try again later",
});

/**
 * Task creation rate limiter - prevent abuse of task creation
 */
const taskCreationRateLimiter = createRateLimiter({
  limit: 20, // 20 task creations
  windowMs: 60 * 60 * 1000, // per hour
  message: "Too many tasks created recently, please try again later",
});

/**
 * General API rate limiter - for all other endpoints
 */
const apiRateLimiter = createRateLimiter();

module.exports = {
  createRateLimiter,
  aiProviderRateLimiter,
  taskCreationRateLimiter,
  apiRateLimiter,
};
