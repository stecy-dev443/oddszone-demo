import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ODDSZONE | Sportsbook Demo", description: "A play-money sportsbook interface for educational use." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><div className="notice">● DEMO ONLY · NO REAL MONEY · NO REAL PAYMENTS</div><header><a className="logo" href="/">ODDS<span>ZONE</span></a><nav><a href="/">Home</a><a href="/sportsbook">Sportsbook</a><a href="/my-bets">My Bets</a><a href="/wallet">Wallet</a><a href="/login">Profile</a></nav></header>{children}<footer>ODDSZONE is an educational simulation. No real wagers, deposits, or payouts.</footer></body></html> }
