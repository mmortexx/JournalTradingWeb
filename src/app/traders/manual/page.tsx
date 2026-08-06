import type { Metadata } from "next";
import { TraderProfileBody } from "@/components/beta/TraderProfilePage";
import { SITE_URL, hreflangDe } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trading manual",
  description: "Métricas, playbooks y revisión de operaciones para traders manuales.",
  alternates: { canonical: `${SITE_URL}/traders/manual/`, languages: hreflangDe("/traders/manual") },
  openGraph: {
    title: "Trading manual — CountPips",
    description: "Métricas, playbooks y revisión de operaciones para traders manuales.",
    url: `${SITE_URL}/traders/manual/`,
    type: "website",
    siteName: "CountPips",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading manual — CountPips",
    description: "Métricas, playbooks y revisión de operaciones para traders manuales.",
  },
};

export default function ManualTradersPage() {
  return <TraderProfileBody profile="manual" />;
}
