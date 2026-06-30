/**
 * Plain JS seed — run with:
 * node scripts/seed-direct.js
 */
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const KEY_PATH = process.env.SERVICE_ACCOUNT_KEY || "./mothers--union-uganda-firebase-adminsdk-fbsvc-8df2e6b8db.json";
const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, "utf8"));

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

const SUPER_ADMIN_UID   = "qJzdcvZW8Xe6fGmtkRpz7zkRh5B3";
const SUPER_ADMIN_EMAIL = "kitegyec@gmail.com";

const FOLDERS = [
  { id: "schools",   name: "Schools",   description: "Outreach and support programmes at schools across the diocese.",         isVisible: true, photoCount: 0 },
  { id: "churches",  name: "Churches",  description: "Activities, services, and gatherings at parish churches.",                isVisible: true, photoCount: 0 },
  { id: "hospitals", name: "Hospitals", description: "Health outreach, maternal care visits, and hospital partnerships.",       isVisible: true, photoCount: 0 },
  { id: "markets",   name: "Markets",   description: "Economic empowerment initiatives and market-based community work.",       isVisible: true, photoCount: 0 },
];

const ORG_CONTENT = [
  { id: "about",   sectionType: "about",   bodyText: "Mothers Union Buganda is the Buganda Diocese chapter of the worldwide Mothers Union, a Christian charity supporting women, children, and families through prayer, advocacy, and practical outreach across parishes, deaneries, and the central diocesan office." },
  { id: "vision",  sectionType: "vision",  bodyText: "A community where every woman, child, and family flourishes in faith, dignity, and love." },
  { id: "mission", sectionType: "mission", bodyText: "To nurture strong Christian family life through prayer, advocacy, and hands-on community outreach across the Buganda Diocese." },
];

async function seed() {
  console.log("Seeding Firestore...\n");

  // Super admin
  await db.collection("admins").doc(SUPER_ADMIN_UID).set({
    email: SUPER_ADMIN_EMAIL,
    role: "super_admin",
    createdAt: Date.now(),
    lastLogin: null,
    createdBy: null,
  }, { merge: true });
  console.log("Admin record created for " + SUPER_ADMIN_EMAIL);

  // Folders
  for (const f of FOLDERS) {
    const { id, ...data } = f;
    await db.collection("folders").doc(id).set({ ...data, createdAt: Date.now(), createdBy: SUPER_ADMIN_EMAIL }, { merge: true });
    console.log("Folder: " + f.name);
  }

  // Org content
  for (const s of ORG_CONTENT) {
    const { id, ...data } = s;
    await db.collection("orgContent").doc(id).set({ ...data, lastUpdated: Date.now(), updatedBy: SUPER_ADMIN_EMAIL }, { merge: true });
    console.log("Content: " + s.sectionType);
  }

  console.log("\nDone!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
