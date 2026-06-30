import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";

/**
 * GET /api/image?url=<encoded-cloudinary-url>
 *
 * Proxies Cloudinary image delivery server-side so the browser only ever
 * makes same-origin requests (localhost/Vercel), bypassing campus DNS blocks
 * on res.cloudinary.com.
 *
 * Security: only allows proxying URLs from our Cloudinary account.
 */

const ALLOWED_HOST = "res.cloudinary.com";
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const limiter = createRateLimiter({
  intervalMs: 60000,
  maxRequests: 200,
  maxUniqueTokens: 500,
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  try {
    await limiter.check(ip, "image_proxy");
  } catch {
    return new NextResponse("Too Many Requests", { status: 429 });
  }
  const rawUrl = req.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  // Only proxy images from our own Cloudinary account to prevent abuse.
  if (
    parsed.hostname !== ALLOWED_HOST ||
    (CLOUD_NAME && !parsed.pathname.startsWith(`/${CLOUD_NAME}/`))
  ) {
    return new NextResponse("URL not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: { Accept: "image/*" },
    });

    if (!upstream.ok) {
      return new NextResponse("Image not found", { status: upstream.status });
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache aggressively: Cloudinary URLs are content-addressed (version in path).
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new NextResponse(`Upstream fetch failed: ${String(err)}`, {
      status: 502,
    });
  }
}
