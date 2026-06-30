import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createRateLimiter } from "@/lib/rateLimit";

const uploadLimiter = createRateLimiter({
  intervalMs: 60000,
  maxRequests: 30,
  maxUniqueTokens: 100,
});

/**
 * POST /api/upload
 *
 * Proxies a file upload to Cloudinary server-side, avoiding browser-level
 * CORS restrictions on api.cloudinary.com that may occur on campus networks.
 *
 * Body (multipart/form-data):
 *   file   — the image File
 *   folder — Cloudinary folder path (e.g. "mu-buganda/post-headers")
 *
 * Returns JSON: { secure_url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    let uid: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
      const adminDoc = await adminDb.collection("admins").doc(uid).get();
      const role = adminDoc.data()?.role;
      if (!adminDoc.exists || (role !== "admin" && role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
      }
    } catch (error) {
      console.error("[/api/upload] Token verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    try {
      await uploadLimiter.check(uid, "upload_api");
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const rawFolder = (form.get("folder") as string) || "mu-buganda";
    // Sanitize folder to prevent directory traversal or malformed paths
    const folder = rawFolder.replace(/[^a-zA-Z0-9-_]/g, "");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return NextResponse.json(
        { error: "Missing Cloudinary config on server" },
        { status: 500 }
      );
    }

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", UPLOAD_PRESET);
    cloudinaryForm.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudinaryForm }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[/api/upload] Cloudinary error:", res.status, text);
      return NextResponse.json(
        { error: `Cloudinary error: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ secure_url: data.secure_url as string });
  } catch (err) {
    console.error("[/api/upload] Unhandled error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
