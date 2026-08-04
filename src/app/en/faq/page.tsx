import type { Metadata } from "next";
import { FaqBody } from "../../faq/page";
import { SITE_URL, hreflangDe } from "@/lib/site";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en/` },
    { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/en/faq/` },
  ],
};

/* Debe coincidir palabra por palabra con las 13 preguntas EN visibles en
   `FAQ.tsx` — copiadas de ahí, no traducidas de nuevo. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is it really a one-time payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You pay once and the app is yours forever, with no recurring fees or hidden charges. All updates within the major version you buy are included, and you get generous discounts on future major versions.",
      },
    },
    {
      "@type": "Question",
      name: "Are my data safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your data lives in a single .sqlite file on your machine. It never gets uploaded to any server: there is no server. You can encrypt the folder with BitLocker/VeraCrypt for an extra layer of security.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export my data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can export your entire journal to CSV (for Excel or Google Sheets), PDF (ready-to-share reports), and JSON (full, re-importable backup). Your data is yours: take it with you whenever you want — no API to shut down, no server to turn off.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Mac or Linux?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CountPips is a native Windows app (WinUI 3). On Mac or Linux you can run it through a Windows virtual machine or Parallels. We're actively exploring a local-first version for Mac and Linux — if you'd like to be a beta tester when it lands, drop us a line.",
      },
    },
    {
      "@type": "Question",
      name: "Can I import from another journal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We support CSV import (flexible format with column mapping) and a dedicated importer for popular journals. If your current journal exports to CSV, you'll have it in your CountPips in less than 5 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "What if I lose my license?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your license is tied to your email address. You can recover it as many times as you need by writing to support. And even if you lose access to your email, your history stays intact because it lives on your machine, not ours.",
      },
    },
    {
      "@type": "Question",
      name: "Are there updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and they're free within the same major version (1.x → 1.x). Major versions (2.0, 3.0…) will be paid, but with a preferential discount for existing license holders.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Credit/debit card and PayPal. We issue VAT invoices where applicable.",
      },
    },
    {
      "@type": "Question",
      name: "Can I try before buying?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can explore the live demo on this very site with deterministic data, no signup and nothing to download. It's the full app recreated: you can walk through the screens and see exactly what you're getting before you pay.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between Core and Pro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Core includes the full journal, 40+ metrics, 2 trading accounts, risk management, discipline, and basic PDF reports. Pro additionally unlocks unlimited accounts, prop firm mode, the Monte Carlo simulator, track record report, risk of ruin, advanced PDF reports, and the rival importer that migrates your old journal in 5 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work without internet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 100% local. Once downloaded and installed, the app needs no internet connection at all: not to open your journal, not to log trades, not to generate reports. Your data never leaves your machine. You only need internet to download the app, receive updates (optional), or activate your license the first time.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use it on multiple computers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A single license lets you install CountPips on your personal computers (your trading desktop and your laptop, for example). Your .sqlite file is portable: copy it to a shared folder or carry it on a USB stick and you'll work from any of your machines as if it were the same one. Extra activations can be arranged by emailing support.",
      },
    },
    {
      "@type": "Question",
      name: "What if I change computers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nothing happens. Your history lives in a single portable .sqlite file. Copy it to the new machine (USB stick, external drive, shared folder) and keep working as if nothing happened. Your license is tied to your email, not the machine: reinstall the app on the new computer, activate with your email and you're done.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about CountPips: price, privacy, compatibility, import, updates and more.",
  alternates: {
    canonical: `${SITE_URL}/en/faq/`,
    languages: hreflangDe("/faq"),
  },
  openGraph: {
    title: "FAQ — CountPips",
    description: "Frequently asked questions about CountPips: price, privacy, compatibility and more.",
    url: `${SITE_URL}/en/faq/`,
    type: "website",
    siteName: "CountPips",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — CountPips",
    description: "Frequently asked questions about CountPips: price, privacy, compatibility, import, updates and more.",
  },
};

export default function FaqEnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqBody />
    </>
  );
}
