"use client";

import { useRef } from "react";

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Deliberately minimal: bold and italic markers only, inserted as plain
 * **text** / *text* markdown-lite syntax around the current selection.
 * This keeps the staff editor foolproof — no rich-text state to corrupt,
 * no HTML to sanitize, and the markers render correctly wherever the
 * bodyText is displayed since BlogPost pages render plain text.
 */
export default function SimpleTextEditor({
  value,
  onChange,
  placeholder,
}: SimpleTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(marker: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const next =
      value.slice(0, selectionStart) +
      marker +
      selected +
      marker +
      value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        selectionStart + marker.length,
        selectionStart + marker.length + selected.length
      );
    });
  }

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] focus-within:border-[var(--color-primary)]">
      <div className="flex gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface)] p-1.5">
        <button
          type="button"
          onClick={() => wrapSelection("**")}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold text-[var(--color-text)] transition-colors hover:bg-white"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("*")}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] italic text-[var(--color-text)] transition-colors hover:bg-white"
          aria-label="Italic"
        >
          i
        </button>
        <span className="ml-2 self-center text-xs text-[var(--color-text-muted)]">
          Select text, then click B or i
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder={placeholder}
        className="w-full resize-none rounded-b-[var(--radius-sm)] px-3.5 py-3 text-[15px] leading-relaxed outline-none"
      />
    </div>
  );
}
