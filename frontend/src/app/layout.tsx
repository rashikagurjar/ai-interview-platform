import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroAssess | Next-Generation AI Interview Agent Simulator",
  description: "Simulated real-life AI Interview Agent Platform. Practice behavioral, technical, and live coding assessments under simulated RAG, prompt caching, and context summarization architectures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
