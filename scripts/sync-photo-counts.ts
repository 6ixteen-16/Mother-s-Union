import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const keyPath = process.env.SERVICE_ACCOUNT_KEY ?? "./serviceAccountKey.json";
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  projectId: "mothers--union-uganda"
});
const db = getFirestore();

async function syncPhotoCounts() {
  console.log("🔄 Syncing photo counts for all folders...\n");

  const foldersSnap = await db.collection("folders").get();
  
  for (const doc of foldersSnap.docs) {
    const photosSnap = await db.collection(`folders/${doc.id}/photos`).get();
    const actualCount = photosSnap.size;
    
    await doc.ref.update({ photoCount: actualCount });
    console.log(`✅ Folder "${doc.data().name}": photoCount set to ${actualCount}`);
  }

  console.log("\n🎉 Sync complete.");
  process.exit(0);
}

syncPhotoCounts().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
