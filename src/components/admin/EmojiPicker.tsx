const EMOJI_OPTIONS = [
  "📁", "🏫", "⛪", "🏥", "🛒", "👩‍👧", "🤝", "📖",
  "🌾", "💧", "🏠", "👶", "🩺", "📚", "🍽️", "🎗️",
  "🌍", "💼", "🧺", "🪙",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          aria-label={`Select ${emoji} icon`}
          aria-pressed={value === emoji}
          className={`btn-press flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-lg transition-colors duration-150 ${
            value === emoji
              ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-1"
              : "bg-[var(--color-surface)] hover:bg-[var(--color-highlight)]/30"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
