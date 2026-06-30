"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { CommunityFolder, Photo } from "@/lib/types";

const DUMMY_FOLDERS: CommunityFolder[] = [
  { id: "schools", name: "Schools", description: "Outreach and support programmes at schools across the diocesess.", iconEmoji: "🏫", isVisible: true, photoCount: 4, createdAt: 0, createdBy: "system" },
  { id: "churches", name: "Churches", description: "Activities, services, and gatherings at parish churches.", iconEmoji: "⛪", isVisible: true, photoCount: 4, createdAt: 0, createdBy: "system" },
  { id: "hospitals", name: "Hospitals", description: "Health outreach, maternal care visits, and hospital partnerships.", iconEmoji: "🏥", isVisible: true, photoCount: 4, createdAt: 0, createdBy: "system" },
  { id: "markets", name: "Markets", description: "Economic empowerment initiatives and market-based community work.", iconEmoji: "🛒", isVisible: true, photoCount: 4, createdAt: 0, createdBy: "system" },
];

export function useGallery(folderId: string) {
  const [folder, setFolder] = useState<CommunityFolder | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const folderSnap = await getDoc(doc(db, "folders", folderId));
        if (!folderSnap.exists() || folderSnap.data().isVisible === false) {
          // Fallback to dummy folder if database is empty/unconfigured
          const dummy = DUMMY_FOLDERS.find((f) => f.id === folderId);
          if (dummy) {
            setFolder(dummy);
            const dummyPhotos = Array.from({ length: dummy.photoCount }).map((_, i) => ({
              id: `dummy-${i}`, folderId, storagePath: "", isPublished: true, createdAt: 0, createdBy: "system", caption: "Sample image", uploadedAt: 0, uploadedBy: "system"
            } as Photo));
            setPhotos(dummyPhotos);
            const dummyUrls: Record<string, string> = {};
            dummyPhotos.forEach(p => dummyUrls[p.id] = "/community-photo.jpg");
            setUrlMap(dummyUrls);
            return;
          } else {
            setNotFound(true);
            return;
          }
        }
        setFolder({ id: folderSnap.id, ...folderSnap.data() } as CommunityFolder);

        const photosQ = query(
          collection(db, "folders", folderId, "photos"),
          where("isPublished", "==", true)
        );
        const photosSnap = await getDocs(photosQ);
        const photoDocs = photosSnap.docs.map(
          (d) => ({ id: d.id, folderId, ...d.data() } as Photo)
        );

        setPhotos(photoDocs);
        const urls: Record<string, string> = {};
        await Promise.all(
          photoDocs.map(async (p) => {
            try {
              if (p.storagePath.startsWith("http")) {
                urls[p.id] = p.storagePath;
              } else {
                urls[p.id] = await getDownloadURL(ref(storage, p.storagePath));
              }
            } catch {
              urls[p.id] = "";
            }
          })
        );
        setUrlMap(urls);
      } catch {
        // Ultimate fallback if connection fails
        const dummy = DUMMY_FOLDERS.find((f) => f.id === folderId);
        if (dummy) {
          setFolder(dummy);
          const dummyPhotos = Array.from({ length: dummy.photoCount }).map((_, i) => ({
            id: `dummy-${i}`, folderId, storagePath: "", isPublished: true, createdAt: 0, createdBy: "system", caption: "Sample image", uploadedAt: 0, uploadedBy: "system"
          } as Photo));
          setPhotos(dummyPhotos);
          const dummyUrls: Record<string, string> = {};
          dummyPhotos.forEach(p => dummyUrls[p.id] = "/community-photo.jpg");
          setUrlMap(dummyUrls);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [folderId]);

  return { folder, photos, urlMap, loading, notFound };
}

export function useAllFolders() {
  const [folders, setFolders] = useState<CommunityFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "folders"),
      where("isVisible", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityFolder));
      setFolders(docs.length > 0 ? docs : DUMMY_FOLDERS);
      setLoading(false);
    }, (error) => {
      setFolders(DUMMY_FOLDERS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { folders, loading };
}
