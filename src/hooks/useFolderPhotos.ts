"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { proxyCloudinaryUrl } from "@/lib/proxyCloudinaryUrl";
import type { CommunityFolder, Photo } from "@/lib/types";
import type { PendingImage } from "@/components/UploadZone";

export function useFolderPhotos(folderId: string) {
  const { user } = useAuth();
  const [folder, setFolder] = useState<CommunityFolder | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});
  // Tracks which folderId the data currently in state actually belongs
  // to. `loading` is derived during render by comparing this against
  // the requested `folderId` — a pure computed value, not state kept in
  // sync via an effect — so it correctly shows a loading state on both
  // first mount (loadedFolderId starts null, never equals a real id)
  // and on folder switches (the old id no longer matches), without any
  // setState call needed inside `reload` before its first await.
  const [loadedFolderId, setLoadedFolderId] = useState<string | null>(null);
  const loading = loadedFolderId !== folderId;

  const reload = useCallback(async () => {
    try {
      const folderSnap = await getDoc(doc(db, "folders", folderId));
      if (folderSnap.exists()) {
        setFolder({ id: folderSnap.id, ...folderSnap.data() } as CommunityFolder);
      }

      const photosSnap = await getDocs(
        collection(db, "folders", folderId, "photos")
      );
      const docs = photosSnap.docs.map(
        (d) => ({ id: d.id, folderId, ...d.data() } as Photo)
      );
      setPhotos(docs);

      const urls: Record<string, string> = {};
      await Promise.all(
        docs.map(async (p) => {
          try {
            if (p.storagePath.startsWith("http")) {
              // Cloudinary URL — route through our image proxy to avoid
              // campus DNS blocks on res.cloudinary.com.
              urls[p.id] = proxyCloudinaryUrl(p.storagePath);
            } else {
              urls[p.id] = await getDownloadURL(ref(storage, p.storagePath));
            }
          } catch {
            urls[p.id] = "";
          }
        })
      );
      setUrlMap(urls);
    } finally {
      // Runs after at least one `await` above has already executed, so
      // this is never the synchronous first statement of the function —
      // it marks the folder as "loaded" (success or failure) so the UI
      // never gets stuck on a permanent skeleton if a fetch throws.
      setLoadedFolderId(folderId);
    }
  }, [folderId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function uploadPhotos(pending: PendingImage[]) {
    for (const item of pending) {
      const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Upload directly to Cloudinary from the browser using the unsigned preset.
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `mu-buganda/${folderId}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      const storagePath = data.secure_url as string;


      await setDoc(doc(db, "folders", folderId, "photos", photoId), {
        storagePath,
        caption: item.caption || "Untitled",
        isPublished: item.isPublished,
        uploadedAt: Date.now(),
        uploadedBy: user?.email || "unknown",
      });
    }

    await updateDoc(doc(db, "folders", folderId), {
      photoCount: increment(pending.length),
    });

    await reload();
  }

  async function updateCaption(photoId: string, caption: string) {
    await updateDoc(doc(db, "folders", folderId, "photos", photoId), {
      caption,
    });
    await reload();
  }

  async function togglePublish(photoId: string, isPublished: boolean) {
    await updateDoc(doc(db, "folders", folderId, "photos", photoId), {
      isPublished,
    });
    await reload();
  }

  async function deletePhoto(photo: Photo) {
    try {
      if (!photo.storagePath.startsWith("http")) {
        await deleteObject(ref(storage, photo.storagePath));
      }
    } catch {
      // Storage object may already be gone — proceed to clean up Firestore
    }
    await deleteDoc(doc(db, "folders", folderId, "photos", photo.id));
    await updateDoc(doc(db, "folders", folderId), {
      photoCount: increment(-1),
    });
    await reload();
  }

  return {
    folder,
    photos,
    urlMap,
    loading,
    uploadPhotos,
    updateCaption,
    togglePublish,
    deletePhoto,
    reload,
  };
}
