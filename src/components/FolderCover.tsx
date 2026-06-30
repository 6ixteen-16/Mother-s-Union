"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FOLDER_ICONS } from "@/lib/icons";
import type { Photo } from "@/lib/types";

export default function FolderCover({ folderId }: { folderId: string }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCover() {
      try {
        const q = query(
          collection(db, "folders", folderId, "photos"),
          where("isPublished", "==", true),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const photo = snap.docs[0].data() as Photo;
          // Cloudinary paths are usually full URLs now
          if (photo.storagePath && photo.storagePath.startsWith("http")) {
            setCoverUrl(photo.storagePath);
          }
        }
      } catch (err) {
        console.error("Failed to fetch folder cover:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCover();
  }, [folderId]);

  if (loading) {
    return <div className="h-full w-full animate-pulse bg-[var(--color-surface)]" />;
  }

  if (!coverUrl) {
    // Graceful fallback to a simple background pattern or solid color if no image
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface)] text-[var(--color-primary)] opacity-40">
        <span className="text-5xl">
          {FOLDER_ICONS[folderId.toLowerCase()] || FOLDER_ICONS.default}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={coverUrl}
      alt="Folder cover"
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => setCoverUrl(null)}
    />
  );
}
