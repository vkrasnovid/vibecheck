import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeCheck.live — What's your text really saying?",
  description: "Paste any text. Get the brutal truth about its energy. The emotional weather report your words deserve.",
  openGraph: {
    title: "VibeCheck.live",
    description: "What's your text really saying?",
    images: ["/og-default.png"],
    type: "website",
    url: "https://vibecheck.live",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeCheck.live",
    description: "Paste any text. Get the brutal truth about its energy.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#f0f0ff]">
        {children}
      </body>
    </html>
  );
}
