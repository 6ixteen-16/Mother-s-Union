/**
 * Creates the Firebase Auth user for the super admin.
 * Run with: node scripts/create-auth-user.js
 */
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");

const KEY_PATH = "./mothers--union-uganda-firebase-adminsdk-fbsvc-8df2e6b8db.json";
const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, "utf8"));

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();

async function createUser() {
  const email = "kitegyec@gmail.com";
  const password = "@#6ixteenZ";

  try {
    // Check if user already exists
    const existing = await auth.getUserByEmail(email).catch(() => null);
    if (existing) {
      console.log("User already exists. UID:", existing.uid);
      console.log("Resetting password...");
      await auth.updateUser(existing.uid, { password });
      console.log("Password updated successfully.");
      return;
    }

    // Create new user
    const user = await auth.createUser({ email, password, emailVerified: true });
    console.log("Auth user created!");
    console.log("UID:", user.uid);
    console.log("Email:", user.email);
    console.log("\nMake sure this UID matches the one in Firestore admins collection.");
  } catch (err) {
    console.error("Failed:", err.message);
  }

  process.exit(0);
}

createUser();
