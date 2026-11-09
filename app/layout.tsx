import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title:"SharpBets — Free-Play Sportsbook",
 description:"A polished virtual-credit sportsbook with provider-backed fixtures, odds, account wallets and responsible-play controls.",
 applicationName:"SharpBets",
 robots:{index:false,follow:false}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>;
}
