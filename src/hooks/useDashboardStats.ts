"use client";

import { useEffect, useState } from "react";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CommunityFolder, Photo, BlogPost } from "@/lib/types";

export interface ActivityItem {
  id: string;
  type: "photo" | "post";
  label: string;
  timestamp: number;
  by: string;
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalFolders: 0,
    totalPhotos: 0,
    publishedPhotos: 0,
    draftPhotos: 0,
    totalPosts: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [foldersSnap, photosSnap, postsSnap] = await Promise.all([
          getDocs(collection(db, "folders")),
          getDocs(collectionGroup(db, "photos")),
          getDocs(collection(db, "blogPosts")),
        ]);

        const folders = foldersSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as CommunityFolder)
        );
        const photos = photosSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Photo)
        );
        const posts = postsSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as BlogPost)
        );

        setStats({
          totalFolders: folders.length,
          totalPhotos: photos.length,
          publishedPhotos: photos.filter((p) => p.isPublished).length,
          draftPhotos: photos.filter((p) => !p.isPublished).length,
          totalPosts: posts.length,
        });

        const photoActivity: ActivityItem[] = photos.map((p) => ({
          id: p.id,
          type: "photo",
          label: p.caption || "Untitled photo",
          timestamp: p.uploadedAt,
          by: p.uploadedBy,
        }));
        const postActivity: ActivityItem[] = posts.map((p) => ({
          id: p.id,
          type: "post",
          label: p.title,
          timestamp: p.createdAt,
          by: p.createdBy,
        }));

        const combined = [...photoActivity, ...postActivity]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        setActivity(combined);
      } catch {
        // Leave defaults on failure
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { stats, activity, loading };
}
