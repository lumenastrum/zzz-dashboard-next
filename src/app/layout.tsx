import type { Metadata } from "next";
import { Archivo, Big_Shoulders, Inter, Oswald, Permanent_Marker, Rajdhani, Space_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import { withBase } from "@/lib/base-path";

// Random Play's four faces (tokens: --rp-font-display/mono/body/hand; globals.css points them here).
// Google folded "Big Shoulders Display" into the variable "Big Shoulders" (opsz axis): headline sizes get
// the display cut on their own.
const rpDisplay = Big_Shoulders({ variable: "--font-rp-display", subsets: ["latin"], weight: "variable", adjustFontFallback: false }); // no metrics table for this face yet
const rpMono = Space_Mono({ variable: "--font-rp-mono", subsets: ["latin"], weight: ["400", "700"] });
const rpBody = Archivo({ variable: "--font-rp-body", subsets: ["latin"], weight: ["400", "600", "800"] });
const rpHand = Permanent_Marker({ variable: "--font-rp-hand", subsets: ["latin"], weight: "400" });
// Soundsystem faces: still worn by /wife/selector until that page moves over.
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const rajdhani = Rajdhani({ variable: "--font-rajdhani", subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Zenless Zone Zero · Random Play",
  description: "A.'s ZZZ rental wall — every agent a tape, every build graded live, every Shiyu and Deadly Assault run on the register.",
};

const fontVars = [rpDisplay.variable, rpMono.variable, rpBody.variable, rpHand.variable, oswald.variable, rajdhani.variable, inter.variable].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <div
          className="site-bg"
          aria-hidden
          style={{ backgroundImage: `url(${withBase("/assets/site-bg-dark.webp")})` }}
        />
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
