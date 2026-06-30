"use client";

import { useState } from "react";
import { useOrgContentEditor } from "@/hooks/useOrgContentEditor";
import { useToast } from "@/components/Toast";
import type { OrgContentSection } from "@/lib/types";

const SECTION_LABELS: Record<OrgContentSection, string> = {
  about: "About Us",
  vision: "Vision",
  mission: "Mission",
  coreValues: "Core Values",
};

function SectionEditor({
  section,
  initialValue,
  onSave,
  saving,
}: {
  section: OrgContentSection;
  initialValue: string;
  onSave: (value: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const dirty = value !== initialValue;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium text-[var(--color-text)]">
          {SECTION_LABELS[section]}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {value.length} characters
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--color-primary)]"
      />
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onSave(value)}
          disabled={!dirty || saving}
          className="btn-press rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function CoreValuesEditor({
  initialValue,
  onSave,
  saving,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  saving: boolean;
}) {
  const [values, setValues] = useState<{title: string, body: string}[]>(() => {
    try {
      return JSON.parse(initialValue);
    } catch {
      return [];
    }
  });

  const dirty = JSON.stringify(values) !== initialValue;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium text-[var(--color-text)]">
          Core Values
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col gap-2 rounded border border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
            <input
              type="text"
              value={v.title}
              onChange={(e) => {
                const next = [...values];
                next[i].title = e.target.value;
                setValues(next);
              }}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold outline-none transition-colors focus:border-[var(--color-primary)]"
            />
            <textarea
              value={v.body}
              onChange={(e) => {
                const next = [...values];
                next[i].body = e.target.value;
                setValues(next);
              }}
              rows={3}
              className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--color-primary)]"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onSave(JSON.stringify(values))}
          disabled={!dirty || saving}
          className="btn-press rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function ContentEditor() {
  const { content, loading, savingSection, saveSection, sections } =
    useOrgContentEditor();
  const { showToast } = useToast();

  async function handleSave(section: OrgContentSection, value: string) {
    await saveSection(section, value);
    showToast("Saved successfully. Changes are live on the homepage.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
          Edit Content
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Update the About Us, Vision, and Mission text shown on the
          homepage.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {sections.map((section) => (
            section === "coreValues" ? (
              <CoreValuesEditor
                key={section}
                initialValue={content[section]}
                saving={savingSection === section}
                onSave={(value) => handleSave(section, value)}
              />
            ) : (
              <SectionEditor
                key={section}
                section={section}
                initialValue={content[section]}
                saving={savingSection === section}
                onSave={(value) => handleSave(section, value)}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}
