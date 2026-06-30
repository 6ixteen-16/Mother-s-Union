import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

const keyPath = process.env.SERVICE_ACCOUNT_KEY ?? "./serviceAccountKey.json";
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

initializeApp({ credential: cert(serviceAccount), projectId: "mothers--union-uganda" });

const db = getFirestore();
const auth = getAuth();

const TARGET_EMAIL = "159khim@gmail.com";
const NEW_PASSWORD = "MU@Admin2024!";

async function unrevokeAdmin() {
  console.log(`🔍 Looking up ${TARGET_EMAIL}...`);

  // Get UID from Firebase Auth
  let uid: string;
  try {
    const authUser = await auth.getUserByEmail(TARGET_EMAIL);
    uid = authUser.uid;
    console.log(`✅ Found Firebase Auth user — UID: ${uid}`);
  } catch {
    console.error("❌ No Firebase Auth account found for this email.");
    process.exit(1);
  }

  // Get or create the Firestore admin doc
  const adminRef = db.collection("admins").doc(uid);
  const adminSnap = await adminRef.get();
  if (adminSnap.exists) {
    const currentRole = adminSnap.data()!.role;
    console.log(`✅ Found admin doc — current role: ${currentRole}`);
    await adminRef.update({ role: "admin" });
  } else {
    console.log(`⚠️  No admin doc found. Creating one...`);
    await adminRef.set({
      email: TARGET_EMAIL,
      role: "admin",
      createdAt: Date.now(),
      lastLogin: null,
      createdBy: "super_admin_script",
    });
  }
  console.log(`✅ Role set to "admin"`);

  // Reset password via Firebase Auth Admin SDK
  await auth.updateUser(uid, { password: NEW_PASSWORD });
  console.log(`✅ Password reset successfully`);

  console.log(`\n📋 New credentials:`);
  console.log(`   Email:    ${TARGET_EMAIL}`);
  console.log(`   Password: ${NEW_PASSWORD}`);
  console.log(`\n⚠️  Share these credentials securely. The admin should change their password after first login.`);

  process.exit(0);
}

unrevokeAdmin().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
