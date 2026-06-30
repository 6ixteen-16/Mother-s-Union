"use client";

import { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { proxyCloudinaryUrl } from "@/lib/proxyCloudinaryUrl";
import type { BlogPost } from "@/lib/types";

// Resolve a stored coverImagePath to a display URL.
// Paths that begin with "http" are already absolute Cloudinary URLs —
// pass them straight through. Anything else is a legacy Firebase Storage
// path (no new posts will produce these, but old docs may still exist).
function resolveCoverUrl(coverImagePath: string | null): string {
  if (!coverImagePath) return "";
  if (coverImagePath.startsWith("http")) return proxyCloudinaryUrl(coverImagePath);
  // Legacy Firebase Storage path — can't resolve without the SDK and CORS
  // isn't configured on this bucket, so return empty and skip gracefully.
  return "";
}

export function useMyBlogPosts() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  // Track by uid string so a new User object instance on token refresh
  // doesn't flip loading back to true and cause an infinite loading hang.
  const [loadedForUid, setLoadedForUid] = useState<string | null>(null);
  const loading = authLoading || (!!user && loadedForUid !== user.uid);

  const reload = useCallback(async () => {
    if (!user?.email) return;
    try {
      const q = query(
        collection(db, "blogPosts"),
        where("createdBy", "==", user.email)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(docs);

      // Build the URL map synchronously — no async needed since Cloudinary
      // URLs are stored directly in the doc (no getDownloadURL round-trip).
      const freshUrls: Record<string, string> = {};
      docs.forEach((p) => {
        const url = resolveCoverUrl(p.coverImagePath);
        if (url) freshUrls[p.id] = url;
      });
      // Merge into existing state rather than replacing wholesale, so that
      // any optimistically-set cover URLs (e.g. right after createPost)
      // survive a concurrent reload() that may not yet see the new doc.
      setCoverUrls((prev) => ({ ...prev, ...freshUrls }));
    } finally {
      setLoadedForUid(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) reload();
  }, [user, reload]);

  async function createPost(input: {
    title: string;
    bodyText: string;
    coverFile: File | null;
    isPublished: boolean;
  }) {
    let coverImagePath: string | null = null;

    if (input.coverFile) {
      // Upload directly to Cloudinary from the browser using the unsigned preset.
      // No server proxy needed in production — CORS is only an issue on restricted
      // campus networks, not on the open internet.
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      const formData = new FormData();
      formData.append("file", input.coverFile);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "mu-buganda/post-headers");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `Image upload failed (${res.status})`);
      }

      const data = await res.json();
      coverImagePath = data.secure_url as string;
    }

    const docRef = await addDoc(collection(db, "blogPosts"), {
      title: input.title,
      bodyText: input.bodyText,
      coverImagePath,
      isPublished: input.isPublished,
      createdAt: Date.now(),
      createdBy: user?.email || "unknown",
      updatedAt: Date.now(),
    });

    // Optimistically prepend the new post so the list updates instantly.
    const newPost: BlogPost = {
      id: docRef.id,
      title: input.title,
      bodyText: input.bodyText,
      coverImagePath,
      isPublished: input.isPublished,
      createdAt: Date.now(),
      createdBy: user?.email || "unknown",
      updatedAt: Date.now(),
    };
    setPosts((prev) => [newPost, ...prev]);
    if (coverImagePath) {
      setCoverUrls((prev) => ({ ...prev, [docRef.id]: coverImagePath! }));
    }
    // Sync with Firestore in the background. Because setCoverUrls now merges
    // (see reload above), the optimistic URL won't be overwritten even if
    // this reload runs before Firestore has propagated the new document.
    await reload();
  }

  async function updatePost(
    id: string,
    input: { title: string; bodyText: string; isPublished: boolean; coverFile?: File | null }
  ) {
    let newCoverPath: string | undefined = undefined;

    if (input.coverFile) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      const formData = new FormData();
      formData.append("file", input.coverFile);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "mu-buganda/post-headers");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `Image upload failed (${res.status})`);
      }

      const data = await res.json();
      newCoverPath = data.secure_url as string;
    }

    const updates: any = {
      title: input.title,
      bodyText: input.bodyText,
      isPublished: input.isPublished,
      updatedAt: Date.now(),
    };

    if (newCoverPath) {
      updates.coverImagePath = newCoverPath;
      // Optimistically update the cover URL state
      setCoverUrls((prev) => ({ ...prev, [id]: newCoverPath! }));
    }

    await updateDoc(doc(db, "blogPosts", id), updates);
    await reload();
  }

  async function deletePost(post: BlogPost) {
    // Cloudinary deletion requires a server-side signed request, so we skip
    // the storage cleanup here and only remove the Firestore doc. The image
    // stays in Cloudinary storage but becomes unreferenced (acceptable for now).
    await deleteDoc(doc(db, "blogPosts", post.id));
    await reload();
  }

  return { posts, coverUrls, loading, createPost, updatePost, deletePost };
}
