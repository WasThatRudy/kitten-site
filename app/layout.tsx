import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Kitten, the partition mover that survives a power cut",
  description:
    "Kitten resizes and moves disk partitions in place, in one reboot, with no live USB. Every step is journaled, so pulling the plug mid-move loses nothing. Open source, GPL-3.0, written in Rust. Under active development.",
  metadataBase: new URL("https://kitten-site.vercel.app"),
  openGraph: {
    title: "Kitten",
    description:
      "Resize your disk. Pull the plug. The cat doesn't flinch. Crash-safe in-place partition moving, journaled end to end.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jetbrains.variable}`}>
      <body className="grain antialiased">
        {children}
      </body>
    </html>
  );
}
