"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HeroImage } from "@/lib/types";

export function useHeroImages() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "heroImages"), orderBy("uploadedAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setImages(snap.docs.map((d) => d.data() as HeroImage));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch hero images:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { images, loading };
}
