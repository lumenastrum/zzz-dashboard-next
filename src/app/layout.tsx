import type { Metadata } from "next";
import { Oswald, Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";

const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const rajdhani = Rajdhani({ variable: "--font-rajdhani", subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Zenless Zone Zero · Soundsystem",
  description: "Andres's ZZZ agent roster, disc-drive grading, and stat audits — New Eridu hi-fi.",
};

const fontVars = [oswald.variable, rajdhani.variable, inter.variable].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
