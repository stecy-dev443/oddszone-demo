import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 const db=Boolean(process.env.DATABASE_URL),secret=Boolean(process.env.BETTER_AUTH_SECRET),odds=Boolean(process.env.ODDS_API_KEY);
 return NextResponse.json({
  service:"SharpBets API",status:db&&secret?"ready":"setup_required",
  capabilities:{database:db,authentication:db&&secret,sportsData:odds,payments:false,virtualCredits:true},
  missing:[...(!db?["DATABASE_URL (Neon Postgres)"]:[]),...(!secret?["BETTER_AUTH_SECRET"]:[]),...(!odds?["ODDS_API_KEY (The Odds API)"]:[])],
  timestamp:new Date().toISOString()
 });
}
