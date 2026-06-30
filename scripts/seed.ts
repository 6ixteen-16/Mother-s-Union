/**
 * SEED SCRIPT — run once after Firebase project is set up.
 *
 * Usage:
 *   1. npm install -g firebase-admin  (or: npx tsx scripts/seed.ts)
 *   2. Download your Firebase service account key from:
 *      Firebase console → Project settings → Service accounts → Generate new private key
 *   3. Set the path below, then run:
 *      SERVICE_ACCOUNT_KEY=./serviceAccountKey.json npx tsx scripts/seed.ts
 *
 * What this does:
 *   - Creates the four initial community folders (Schools, Church, Hospital, Market)
 *   - Creates the three orgContent placeholder documents
 *   - Creates the super admin record in the admins collection
 *     (the Firebase Auth user must already exist — create it first in
 *      Firebase console → Authentication → Add user)
 *
 * Safe to re-run: uses set() with merge, so existing docs are not overwritten.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const keyPath = process.env.SERVICE_ACCOUNT_KEY ?? "./serviceAccountKey.json";
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  projectId: "mothers--union-uganda",
  databaseURL: "https://mothers--union-uganda.firebaseio.com"
});
const db = getFirestore();

// ── Super admin ────────────────────────────────────────────────────────────
// Firebase Auth UID for kitegyec@gmail.com (found in Firebase console → Authentication → Users).
const SUPER_ADMIN_UID = "qJzdcvZW8Xe6fGmtkRpz7zkRh5B3";
const SUPER_ADMIN_EMAIL = "kitegyec@gmail.com";

// ── Initial folders ────────────────────────────────────────────────────────
const INITIAL_FOLDERS = [
  {
    id: "schools",
    name: "Schools",
    description:
      "Outreach and support programmes at schools across the dioceses.",
    iconEmoji: "🏫",
    isVisible: true,
    photoCount: 0,
    createdAt: Date.now(),
    createdBy: SUPER_ADMIN_EMAIL,
  },
  {
    id: "church",
    name: "Church",
    description: "Activities, services, and gatherings at parish churches.",
    iconEmoji: "⛪",
    isVisible: true,
    photoCount: 0,
    createdAt: Date.now(),
    createdBy: SUPER_ADMIN_EMAIL,
  },
  {
    id: "hospital",
    name: "Hospital",
    description:
      "Health outreach, maternal care visits, and hospital partnerships.",
    iconEmoji: "🏥",
    isVisible: true,
    photoCount: 0,
    createdAt: Date.now(),
    createdBy: SUPER_ADMIN_EMAIL,
  },
  {
    id: "market",
    name: "Market",
    description:
      "Economic empowerment initiatives and market-based community work.",
    iconEmoji: "🛒",
    isVisible: true,
    photoCount: 0,
    createdAt: Date.now(),
    createdBy: SUPER_ADMIN_EMAIL,
  },
];

// ── Org content placeholders ───────────────────────────────────────────────
const ORG_CONTENT = [
  {
    id: "about",
    sectionType: "about",
    bodyText:
      "Mothers Union Buganda is the Buganda dioceses chapter of the worldwide Mothers Union, a Christian charity supporting women, children, and families through prayer, advocacy, and practical outreach across parishes, deaneries, and the central diocesan office.",
    lastUpdated: Date.now(),
    updatedBy: SUPER_ADMIN_EMAIL,
  },
  {
    id: "vision",
    sectionType: "vision",
    bodyText:
      "A community where every woman, child, and family flourishes in faith, dignity, and love.",
    lastUpdated: Date.now(),
    updatedBy: SUPER_ADMIN_EMAIL,
  },
  {
    id: "mission",
    sectionType: "mission",
    bodyText:
      "To nurture strong Christian family life through prayer, advocacy, and hands-on community outreach across the Buganda dioceses.",
    lastUpdated: Date.now(),
    updatedBy: SUPER_ADMIN_EMAIL,
  },
];

async function seed() {
  console.log("🌱 Seeding Firestore...\n");

  // Super admin record
  if (SUPER_ADMIN_UID === "REPLACE_WITH_REAL_UID") {
    console.warn(
      "⚠️  SUPER_ADMIN_UID is still set to 'REPLACE_WITH_REAL_UID'.\n" +
      "   Open scripts/seed.ts and replace it with the real Firebase Auth UID\n" +
      "   for kitegyec@gmail.com before running this script.\n"
    );
  } else {
    await db
      .collection("admins")
      .doc(SUPER_ADMIN_UID)
      .set(
        {
          email: SUPER_ADMIN_EMAIL,
          role: "super_admin",
          createdAt: Date.now(),
          lastLogin: null,
          createdBy: null,
        },
        { merge: true }
      );
    console.log(`✅ Super admin record created for ${SUPER_ADMIN_EMAIL}`);
  }

  // Folders
  for (const folder of INITIAL_FOLDERS) {
    const { id, ...data } = folder;
    await db.collection("folders").doc(id).set(data, { merge: true });
    console.log(`✅ Folder: ${folder.iconEmoji} ${folder.name}`);
  }

  // Org content
  for (const section of ORG_CONTENT) {
    const { id, ...data } = section;
    await db.collection("orgContent").doc(id).set(data, { merge: true });
    console.log(`✅ Org content: ${section.sectionType}`);
  }

  console.log("\n🎉 Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
