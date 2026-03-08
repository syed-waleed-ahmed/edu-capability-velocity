import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDU Capability Velocity | AI Learning Micro-Experiences",
  description:
    "Transform text into interactive flashcards, quizzes, and study plans with AI-powered agents. Built with Mastra, Next.js, and the AI SDK.",
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
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
