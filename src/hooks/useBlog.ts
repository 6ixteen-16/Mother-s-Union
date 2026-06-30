"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { proxyCloudinaryUrl } from "@/lib/proxyCloudinaryUrl";
import type { BlogPost } from "@/lib/types";

// Resolve a stored coverImagePath to a display URL.
// New posts store an absolute Cloudinary HTTPS URL directly.
// Legacy posts stored a Firebase Storage path — CORS isn't configured on
// this bucket, so we return "" for those and skip the image gracefully.
function resolveCoverUrl(coverImagePath: string | null): string {
  if (!coverImagePath) return "";
  if (coverImagePath.startsWith("http")) return proxyCloudinaryUrl(coverImagePath);
  return "";
}

export function useBlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "blogPosts"),
          where("isPublished", "==", true)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as BlogPost)
        );
        docs.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(docs);

        // URL resolution is synchronous — Cloudinary URLs are stored directly
        // in the doc, so no async getDownloadURL round-trip is needed.
        const urls: Record<string, string> = {};
        docs.forEach((p) => {
          const url = resolveCoverUrl(p.coverImagePath);
          if (url) urls[p.id] = url;
        });
        setCoverUrls(urls);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { posts, coverUrls, loading };
}

export function useBlogPost(postId: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "blogPosts", postId));
        if (!snap.exists() || snap.data().isPublished === false) {
          setNotFound(true);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as BlogPost;
        setPost(data);
        setCoverUrl(resolveCoverUrl(data.coverImagePath));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  return { post, coverUrl, loading, notFound };
}
