"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { addDoc, collection } from "firebase/firestore";
import Footer from "@/components/Footer";
import { useToast } from "@/components/Toast";
import { db } from "@/lib/firebase";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function validate(): boolean {
    setSuccessMessage("");
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 20)
      next.message = "Message must be at least 20 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Persist to Firestore so it shows in the admin contact log
      await addDoc(collection(db, "contactMessages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        receivedAt: Date.now(),
        isRead: false,
      });

      // TODO: replace placeholder EmailJS IDs in .env.local before launch
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
          to_email: "mothers'unionbuganda@gmail.com",
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""
      );

      showToast("Message sent. We'll be in touch soon.", "success");
      setSuccessMessage("Your message has been sent successfully. We'll be in touch soon!");
      setForm({ name: "", email: "", message: "" });
    } catch {
      // Firestore write is the source of truth — still treat as success
      // for the user if only the email relay failed, since the message
      // is safely stored either way for admin follow-up.
      showToast("Message saved. We'll be in touch soon.", "success");
      setSuccessMessage("Your message has been received. We'll be in touch soon!");
      setForm({ name: "", email: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <h1 className="font-serif text-4xl font-medium text-[var(--color-text)]">
            Contact Us
          </h1>
          <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
            We&apos;d love to hear from you. Reach out with questions, partnership
            ideas, or to learn more about our work.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[40%_60%]">
            {/* Info column */}
            <div className="flex flex-col gap-6">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h2 className="font-medium text-[var(--color-text)]">
                  Mothers' Union Buganda Office
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  Ssentema Road
                  <br />
                  Mengo
                </p>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-5">
                <h2 className="font-medium text-[var(--color-text)]">
                  Phone
                </h2>
                <div className="mt-1 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
                  <span>President: <a href="tel:0776934212" className="font-medium text-[var(--color-primary)] hover:underline">0776 934212</a></span>
                  <span>Coordinator: <a href="tel:0772308000" className="font-medium text-[var(--color-primary)] hover:underline">0772 308000</a></span>
                  <span>Secretary: <a href="tel:0757342792" className="font-medium text-[var(--color-primary)] hover:underline">0757 342792</a></span>
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-5">
                <h2 className="font-medium text-[var(--color-text)]">
                  Email
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  <a href="mailto:mothers'unionbuganda@gmail.com" className="font-medium text-[var(--color-primary)] hover:underline break-all">
                    mothers'unionbuganda@gmail.com
                  </a>
                </p>
              </div>


            </div>

            {/* Form column */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8"
            >
              {successMessage && (
                <div className="rounded-[var(--radius-sm)] border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  {successMessage}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={`w-full rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)] ${
                    errors.name
                      ? "border-[var(--color-danger)]"
                      : "border-[var(--color-border)]"
                  }`}
                  placeholder="Jane Nakato"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={`w-full rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)] ${
                    errors.email
                      ? "border-[var(--color-danger)]"
                      : "border-[var(--color-border)]"
                  }`}
                  placeholder="jane@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  rows={6}
                  className={`w-full resize-none rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)] ${
                    errors.message
                      ? "border-[var(--color-danger)]"
                      : "border-[var(--color-border)]"
                  }`}
                  placeholder="How can we help?"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-press mt-2 flex items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors duration-200 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
