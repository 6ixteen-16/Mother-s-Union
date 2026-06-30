"use client";

import { useEffect, useState } from "react";
import { collection, collectionGroup, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Photo, BlogPost } from "@/lib/types";

export interface MyActivityItem {
  id: string;
  type: "photo" | "post";
  label: string;
  timestamp: number;
}

export function useMyActivity() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<MyActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    async function load() {
      try {
        const photosQ = query(
          collectionGroup(db, "photos"),
          where("uploadedBy", "==", user!.email),
          orderBy("uploadedAt", "desc")
        );
        const postsQ = query(
          collection(db, "blogPosts"),
          where("createdBy", "==", user!.email)
        );

        const [photosSnap, postsSnap] = await Promise.all([
          getDocs(photosQ),
          getDocs(postsQ),
        ]);

        const photoItems: MyActivityItem[] = photosSnap.docs.map((d) => {
          const data = d.data() as Photo;
          return {
            id: d.id,
            type: "photo",
            label: data.caption || "Untitled photo",
            timestamp: data.uploadedAt,
          };
        });
        const postItems: MyActivityItem[] = postsSnap.docs.map((d) => {
          const data = d.data() as BlogPost;
          return {
            id: d.id,
            type: "post",
            label: data.title,
            timestamp: data.createdAt,
          };
        });

        setActivity(
          [...photoItems, ...postItems]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 8)
        );
      } catch (error) {
        console.error("Activity fetch error:", error);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return { activity, loading };
}
