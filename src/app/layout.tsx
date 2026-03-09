import type { Metadata } from "next";
import { IBM_Plex_Mono, Merriweather_Sans } from "next/font/google";
import "./globals.css";

const merriweatherSans = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-merriweather-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDU Capability Velocity | Academic Learning Workspace",
  description:
    "A structured AI-powered education workspace for flashcards, quizzes, study plans, and source-grounded study packages.",
  keywords: [
    "AI learning",
    "flashcards",
    "quiz generator",
    "study plan",
    "educational AI",
    "micro-experiences",
  ],
  authors: [{ name: "MemorAIz" }],
  openGraph: {
    title: "EDU Capability Velocity",
    description:
      "AI-powered learning micro-experiences — flashcards, quizzes, and study plans in seconds.",
    type: "website",
    locale: "en_US",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${merriweatherSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
