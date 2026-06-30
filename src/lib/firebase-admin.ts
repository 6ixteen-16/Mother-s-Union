import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

if (!getApps().length) {
  try {
    let credential;

    if (process.env.FIREBASE_ADMIN_KEY) {
      // Production (Vercel): key is stored as a base64-encoded env variable
      const json = Buffer.from(process.env.FIREBASE_ADMIN_KEY, "base64").toString("utf8");
      const serviceAccount = JSON.parse(json);
      credential = cert(serviceAccount);
    } else {
      // Local development: read from the JSON key file using fs (not require,
      // so Turbopack doesn't try to statically bundle the missing file)
      const serviceAccountPath = path.join(process.cwd(), "mothers--union-uganda-firebase-adminsdk-fbsvc-8df2e6b8db.json");
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      credential = cert(serviceAccount);
    }

    initializeApp({ credential });
  } catch (error) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK:", error);
    initializeApp();
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();


