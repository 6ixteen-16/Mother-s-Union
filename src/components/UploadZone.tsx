"use client";

import { useCallback, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

export interface PendingImage {
  file: File;
  previewUrl: string;
  caption: string;
  isPublished: boolean;
}

interface UploadZoneProps {
  pending: PendingImage[];
  onChange: (pending: PendingImage[]) => void;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function UploadZone({ pending, onChange }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
        return true;
      });

      if (files.length === 0) return;

      setCompressing(true);
      try {
        const compressed = await Promise.all(
          files.map(async (file) => {
            const result = await imageCompression(file, {
              maxWidthOrHeight: 1200,
              initialQuality: 0.8,
              useWebWorker: true,
              fileType: "image/webp",
            });
            return {
              file: result,
              previewUrl: URL.createObjectURL(result),
              caption: "",
              isPublished: true,
            } satisfies PendingImage;
          })
        );
        onChange([...pending, ...compressed]);
      } finally {
        setCompressing(false);
      }
    },
    [pending, onChange]
  );

  function updateCaption(idx: number, caption: string) {
    const next = [...pending];
    next[idx] = { ...next[idx], caption };
    onChange(next);
  }

  function togglePublish(idx: number) {
    const next = [...pending];
    next[idx] = { ...next[idx], isPublished: !next[idx].isPublished };
    onChange(next);
  }

  function removePending(idx: number) {
    onChange(pending.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${
          dragOver
            ? "scale-[1.01] border-[var(--color-primary)] bg-[var(--color-surface)]"
            : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary-light)] hover:bg-[var(--color-surface)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`text-[var(--color-primary)] transition-transform duration-300 ${
            dragOver ? "scale-110" : ""
          }`}
        >
          <path
            d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {compressing
              ? "Compressing images…"
              : "Drag photos here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            JPEG, PNG, or WebP — max 5MB each
          </p>
        </div>
        {compressing && (
          <div className="h-1 w-32 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div className="skeleton h-full w-full" />
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pending.map((p, idx) => (
            <div
              key={p.previewUrl}
              className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3 animate-[fade-up_280ms_var(--ease-smooth)]"
            >
              <img
                src={p.previewUrl}
                alt="Preview"
                className="h-20 w-20 shrink-0 rounded-[var(--radius-sm)] object-cover"
              />
              <div className="flex flex-1 flex-col gap-2">
                <input
                  type="text"
                  placeholder="Caption (required)"
                  value={p.caption}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={p.isPublished}
                      onChange={() => togglePublish(idx)}
                      className="accent-[var(--color-primary)]"
                    />
                    Publish immediately
                  </label>
                  <button
                    onClick={() => removePending(idx)}
                    aria-label="Remove image"
                    className="text-xs font-medium text-[var(--color-danger)] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
