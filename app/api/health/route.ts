import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 const database=Boolean(process.env.DATABASE_URL),secret=Boolean(process.env.BETTER_AUTH_SECRET),sports=Boolean(process.env.ODDS_API_KEY),email=Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),admin=Boolean(process.env.ADMIN_EMAIL);
 return NextResponse.json({
  service:"SharpBets API",status:database&&secret?"ready":"setup_required",
  capabilities:{database,authentication:database&&secret,sportsData:sports,passwordRecovery:email,adminProvisioning:admin,payments:false,virtualCredits:true},
  missing:[...(!database?["DATABASE_URL (Neon Postgres)"]:[]),...(!secret?["BETTER_AUTH_SECRET"]:[]),...(!sports?["ODDS_API_KEY (The Odds API)"]:[]),...(!email?["RESEND_API_KEY + EMAIL_FROM (password recovery)"]:[]),...(!admin?["ADMIN_EMAIL (first admin account)"]:[])],
  timestamp:new Date().toISOString()
 });
}
