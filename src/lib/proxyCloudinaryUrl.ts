/**
 * proxyCloudinaryUrl
 *
 * Rewrites a Cloudinary delivery URL to go through our server-side image
 * proxy (/api/image), so the browser never needs to resolve res.cloudinary.com
 * directly. This is transparent to the rest of the app — components just use
 * the returned string as an <img> src.
 *
 * Non-Cloudinary URLs (empty strings, Firebase Storage paths, etc.) are
 * returned unchanged.
 */
export function proxyCloudinaryUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("https://res.cloudinary.com/")) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
