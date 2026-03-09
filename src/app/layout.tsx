import type { Metadata } from "next";
import "@fontsource/merriweather-sans/400.css";
import "@fontsource/merriweather-sans/500.css";
import "@fontsource/merriweather-sans/600.css";
import "@fontsource/merriweather-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
