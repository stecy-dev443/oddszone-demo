import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SharpBets — Free Play Sports Arena",
  description: "A responsive free-to-play sports odds simulator with mock live matches, virtual credits and responsible-play tools.",
  applicationName: "SharpBets"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
