"use client";

import { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { CommunityFolder } from "@/lib/types";

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<CommunityFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "folders"));
      setFolders(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityFolder))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createFolder(input: {
    name: string;
    description: string;
    iconEmoji: string;
    isVisible: boolean;
  }) {
    const docRef = await addDoc(collection(db, "folders"), {
      ...input,
      createdAt: Date.now(),
      createdBy: user?.email || "unknown",
      photoCount: 0,
    });
    await reload();
    return docRef.id;
  }

  async function updateFolder(
    id: string,
    input: Partial<Omit<CommunityFolder, "id">>
  ) {
    await updateDoc(doc(db, "folders", id), input);
    await reload();
  }

  async function softDeleteFolder(id: string) {
    await updateDoc(doc(db, "folders", id), { isVisible: false });
    await reload();
  }

  async function hardDeleteFolder(id: string) {
    // Delete all photos in the subcollection first to prevent orphans
    // that would continue showing up in collectionGroup queries.
    const photosSnap = await getDocs(collection(db, "folders", id, "photos"));
    await Promise.all(photosSnap.docs.map(d => deleteDoc(d.ref)));
    
    // Now delete the folder itself
    await deleteDoc(doc(db, "folders", id));
    await reload();
  }

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    softDeleteFolder,
    hardDeleteFolder,
    reload,
  };
}
