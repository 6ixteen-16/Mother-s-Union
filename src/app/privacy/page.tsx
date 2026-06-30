import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Mothers Union Buganda collects, uses, and protects visitor information.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="flex-1 bg-[var(--color-surface)] py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-5">
          <h1 className="font-serif text-3xl font-medium text-[var(--color-text)] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Last updated: 25/06/2026
          </p>

          <div className="mt-8 flex flex-col gap-7 text-[15px] leading-relaxed text-[var(--color-text)]">
            <section>
              <h2 className="mb-2 font-serif text-xl font-medium">
                What we collect
              </h2>
              <p>
                When you submit our contact form, we collect your name,
                email address, and message content so we can respond to
                your enquiry. We also collect anonymous, aggregated
                analytics data — such as which pages are visited and how
                often — to understand how the site is used. This analytics
                data is not linked to your identity.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-medium">
                Why we collect it
              </h2>
              <p>
                Contact form information is used solely to respond to your
                message. Analytics information helps us improve the site
                and understand which community programmes visitors are
                most interested in. We do not sell or share your personal
                information with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-medium">
                How long we keep it
              </h2>
              <p>
                Contact messages are retained for as long as needed to
                address your enquiry and for reasonable record-keeping
                afterward. Anonymous analytics data is retained in
                aggregate form and is not tied to any individual visitor.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-medium">
                Your rights under the Data Protection and Privacy Act,
                2019
              </h2>
              <p>
                Uganda&apos;s Data Protection and Privacy Act, 2019 gives you
                the right to know what personal data we hold about you,
                to request a copy of it, to request correction of
                inaccurate data, and to request deletion of your personal
                data where reasonably possible. To exercise any of these
                rights, contact us using the details below.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-medium">
                Cookies
              </h2>
              <p>
                This site may use cookies for basic analytics purposes.
                You can disable cookies in your browser settings at any
                time; doing so will not affect your ability to browse the
                public pages of this site.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-medium">
                Contact us about your data
              </h2>
              <p>
                To request access to, correction of, or deletion of your
                personal data, write to us at{" "}
                <a href="mailto:mothers'unionbuganda@gmail.com" className="font-medium text-[var(--color-primary)] hover:underline">
                  mothers'unionbuganda@gmail.com
                </a>{" "}
                or visit our Mothers' Union Buganda Office at Ssentema Road, Mengo.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
