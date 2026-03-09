import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDU Capability Velocity | Intelligent Study Studio",
  description:
    "A modern AI learning studio that transforms prompts into interactive quizzes, flashcards, study plans, and source-grounded study packages.",
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
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
