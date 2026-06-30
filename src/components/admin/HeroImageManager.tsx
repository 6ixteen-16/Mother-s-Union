"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useHeroImages } from "@/hooks/useHeroImages";
import { useToast } from "@/components/Toast";
import type { HeroImage } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export default function HeroImageManager() {
  const { images, loading } = useHeroImages();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (e.g. max 5MB)
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      if (!cloudName || !uploadPreset) {
        throw new Error("Missing Cloudinary configuration");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "mu-buganda/hero");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        let errorMsg = "Upload failed";
        try {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            errorMsg = data.error?.message || data.error || errorMsg;
          } catch {
            console.error("Non-JSON error response from upload API:", text);
            errorMsg = `Server error ${res.status}: ${text.substring(0, 100)}`;
          }
        } catch (e) {
          errorMsg = "Upload failed and couldn't read response";
        }
        throw new Error(errorMsg);
      }

      let responseData;
      try {
        const text = await res.text();
        responseData = JSON.parse(text);
      } catch (e) {
        throw new Error("Server returned an invalid non-JSON response on success.");
      }
      
      const { secure_url } = responseData;

      const imageId = uuidv4();
      const heroImage: HeroImage = {
        id: imageId,
        storagePath: secure_url,
        uploadedAt: Date.now(),
        uploadedBy: auth.currentUser?.email || "Unknown",
      };

      await setDoc(doc(db, "heroImages", imageId), heroImage);
      showToast("Hero image uploaded successfully");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to upload image", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(image: HeroImage) {
    if (!confirm("Are you sure you want to delete this hero image?")) return;

    try {
      await deleteDoc(doc(db, "heroImages", image.id));
      showToast("Hero image deleted");
    } catch (error: any) {
      console.error(error);
      showToast("Failed to delete image", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
          Hero Images
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Manage the slideshow images that appear at the top of the homepage.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
        <div>
          <h2 className="font-medium text-[var(--color-text)]">Add New Image</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Recommended size: 1920x1080px (landscape).
          </p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button
            disabled={uploading}
            className="btn-press flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {uploading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            )}
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-[var(--radius-lg)]" />
          ))
        ) : images.length === 0 ? (
          <div className="col-span-full rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-transparent p-10 text-center">
            <p className="text-[var(--color-text-muted)]">No hero images uploaded yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Upload an image to get started. The default fallback images will be shown otherwise.
            </p>
          </div>
        ) : (
          images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white"
            >
              <div className="relative aspect-video w-full bg-[var(--color-surface)]">
                <Image
                  src={img.storagePath}
                  alt="Hero Image"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  Uploaded by: {img.uploadedBy}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {new Date(img.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={() => handleDelete(img)}
                className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-700 focus:opacity-100"
                aria-label="Delete image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
