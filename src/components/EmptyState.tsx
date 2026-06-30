interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "photos" | "folders" | "posts" | "messages";
}

const ICONS: Record<string, React.ReactNode> = {
  photos: (
    <path
      d="M28 56h64v-32l-16-16H44L28 24v32z M28 56l18-18 12 10 14-14 14 14v8H28z M50 32a6 6 0 110-12 6 6 0 010 12z"
      fill="none"
      stroke="var(--color-border)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  folders: (
    <path
      d="M20 32v32a4 4 0 004 4h56a4 4 0 004-4V40a4 4 0 00-4-4H52l-6-8H24a4 4 0 00-4 4z"
      fill="none"
      stroke="var(--color-border)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  posts: (
    <path
      d="M28 20h44a4 4 0 014 4v52l-12-8-12 8-12-8-12 8V24a4 4 0 014-4z M36 36h28 M36 48h28 M36 60h16"
      fill="none"
      stroke="var(--color-border)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  messages: (
    <path
      d="M20 28h60a4 4 0 014 4v32a4 4 0 01-4 4H40l-14 12V68H20a4 4 0 01-4-4V32a4 4 0 014-4z"
      fill="none"
      stroke="var(--color-border)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
};

export default function EmptyState({
  title,
  description,
  icon = "photos",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <svg width="100" height="76" viewBox="0 0 100 76" aria-hidden="true">
        {ICONS[icon]}
      </svg>
      <div>
        <p className="text-base font-medium text-[var(--color-text)]">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
