const requestCounts = new Map();

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Request-Id", req.id || "");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self'"
  );
  next();
};

export const attachRequestId = (req, res, next) => {
  req.id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  next();
};

export const basicRateLimit = (req, res, next) => {
  const windowMs = 60 * 1000;
  const maxRequests = 180;
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const entry = requestCounts.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  requestCounts.set(key, entry);
  res.setHeader("RateLimit-Limit", String(maxRequests));
  res.setHeader("RateLimit-Remaining", String(Math.max(0, maxRequests - entry.count)));

  if (entry.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again shortly.",
    });
  }

  return next();
};
