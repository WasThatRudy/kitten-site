import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://kitten-site-blue.vercel.app"),
  openGraph: {
    title: "Kitten",
    description:
      "Crash-safe in-place partition moving: one reboot, no live USB, journaled end to end. A power cut mid-move loses nothing.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Resize your disk. Pull the plug. The cat doesn't flinch.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitten",
    description:
      "Crash-safe in-place partition moving: one reboot, no live USB, journaled end to end.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

const themeInit = `(function(){try{var t=localStorage.getItem("kitten-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jetbrains.variable}`}>
      <body className="grain antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
