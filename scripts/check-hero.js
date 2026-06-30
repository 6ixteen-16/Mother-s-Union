const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const KEY_PATH = "./mothers--union-uganda-firebase-adminsdk-fbsvc-8df2e6b8db.json";
if (!fs.existsSync(KEY_PATH)) {
  console.log("No key file found. Using default app...");
  initializeApp();
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, "utf8"));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function check() {
  const snap = await db.collection("heroImages").get();
  console.log("Total heroImages:", snap.size);
  snap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}
check().catch(console.error);
