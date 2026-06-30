interface RateLimitContext {
  count: number;
  lastRequest: number;
}

const rateLimiters = new Map<string, Map<string, RateLimitContext>>();

/**
 * Creates a simple in-memory rate limiter.
 * Note: In serverless environments (like Vercel), this cache is isolated
 * per function instance, but it's still effective at mitigating burst
 * attacks from a single source.
 */
export function createRateLimiter({
  intervalMs,
  maxRequests,
  maxUniqueTokens,
}: {
  intervalMs: number;
  maxRequests: number;
  maxUniqueTokens: number;
}) {
  return {
    check: (token: string, namespace = "global") => {
      return new Promise<void>((resolve, reject) => {
        const now = Date.now();
        let namespaceMap = rateLimiters.get(namespace);

        if (!namespaceMap) {
          namespaceMap = new Map();
          rateLimiters.set(namespace, namespaceMap);
        }

        // Prune map if it grows too large to prevent memory leaks
        if (namespaceMap.size > maxUniqueTokens) {
          for (const [key, val] of namespaceMap.entries()) {
            if (now - val.lastRequest > intervalMs) {
              namespaceMap.delete(key);
            }
          }
        }

        const context = namespaceMap.get(token) || { count: 0, lastRequest: now };

        // Reset if the interval has passed
        if (now - context.lastRequest > intervalMs) {
          context.count = 0;
        }

        context.count += 1;
        context.lastRequest = now;
        namespaceMap.set(token, context);

        if (context.count > maxRequests) {
          reject(new Error("Rate limit exceeded"));
        } else {
          resolve();
        }
      });
    },
  };
}
