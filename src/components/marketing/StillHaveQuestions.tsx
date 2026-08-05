"use client";

import { motion } from "framer-motion";

import { useLang } from "@/lib/i18n";
import { SUPPORT_EMAIL } from "@/lib/forms";
import { Reveal } from "@/components/tj/Reveal";
import { asset } from "@/lib/asset";
import { withLocale } from "@/lib/locale";

/**
 * StillHaveQuestions — small transitional banner placed between the FAQ
 * accordion and the ContactSupport section.
 *
 * Design:
 *  - `tj-paper rounded-[2px] border border-[rgb(var(--divider)/0.13)] p-6` centered banner with a single line of copy.
 *  - Accent on the second clause to draw the eye and signal "help is here".
 *  - Inline CTA row under the headline — two tappable links (mailto support +
 *    /faq) so the banner reads as an action, not a statement. Each ≥44 px.
 *  - Accent-only palette — no indigo/blue.
 *
 * Currently not mounted on /faq (the page chains ContactSupport + ContactForm
 * which already cover the same intent), but kept in the repo for reuse on
 * feature pages where a single transitional banner is wanted.
 */
export function StillHaveQuestions() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "¿Aún tienes dudas?" : "Still have questions?"}
      className="relative py-8 md:py-10"
    >
      <div className="tj-container">
        <Reveal y={18}>
          <motion.div
            className="relative tj-paper rounded-[2px] border border-[rgb(var(--divider)/0.13)] p-6 md:p-7 overflow-hidden text-center"
          >
            <p className="relative text-lg md:text-xl font-medium text-primary text-balance">
              {es ? (
                <>
                  ¿Aún tienes dudas?{" "}
                  <span className="text-gradient">Estamos aquí para ayudarte.</span>
                </>
              ) : (
                <>
                  Still have questions?{" "}
                  <span className="text-gradient">We&apos;re here to help.</span>
                </>
              )}
            </p>
            {/* Inline CTA row — two tappable links side-by-side. Each link
                is wrapped in an inline-flex container with min-h-[44px] so
                the touch target clears the iOS HIG / Material 48 dp floor
                even when the link text itself is short. */}
            <div className="relative mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[2px] bg-[rgb(var(--accent-base))] px-5 text-sm font-semibold text-[rgb(var(--accent-ink))] transition-[background-color,transform] duration-200 hover:bg-[rgb(var(--accent-hover))] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {es ? "Escríbenos" : "Email us"}
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </a>
              <a
                href={asset(withLocale("/faq", lang))}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[2px] border border-[rgb(var(--divider)/0.15)] bg-[rgb(var(--divider)/0.04)] px-5 text-sm font-medium text-primary transition-[background-color,border-color,transform] duration-200 hover:border-[rgb(var(--accent-base)/0.35)] hover:bg-[rgb(var(--divider)/0.08)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {es ? "Ver FAQ" : "See FAQ"}
              </a>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
