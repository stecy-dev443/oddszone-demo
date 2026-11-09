import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){
 const databaseConfigured=Boolean(process.env.DATABASE_URL),secret=Boolean(process.env.BETTER_AUTH_SECRET),sports=Boolean(process.env.ODDS_API_KEY),email=Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),admin=Boolean(process.env.ADMIN_EMAIL);
 let database=false,schemaReady=false;
 if(databaseConfigured){
  try{
   const result=await getDb().execute(sql`select to_regclass('public.user') as user_table, to_regclass('public.wallets') as wallet_table, to_regclass('public.fixtures') as fixtures_table`);
   const row=(result as any).rows?.[0];
   database=true;schemaReady=Boolean(row?.user_table&&row?.wallet_table&&row?.fixtures_table);
  }catch{/* Health response reports missing or unreachable database. */}
 }
 const missing=[
  ...(!databaseConfigured?["DATABASE_URL (Neon Postgres)"]:!database?["Database connection is unreachable"]:[]),
  ...(database&&!schemaReady?["Database schema (run npm run db:push)"]:[]),
  ...(!secret?["BETTER_AUTH_SECRET"]:[]),
  ...(!sports?["ODDS_API_KEY (The Odds API)"]:[]),
  ...(!email?["RESEND_API_KEY + EMAIL_FROM (password recovery)"]:[]),
  ...(!admin?["ADMIN_EMAIL (first admin account)"]:[])
 ];
 return NextResponse.json({
  service:"SharpBets API",status:database&&schemaReady&&secret?"ready":"setup_required",
  capabilities:{database,authentication:database&&schemaReady&&secret,sportsData:sports,passwordRecovery:email,adminProvisioning:admin,payments:false,virtualCredits:true},
  missing,timestamp:new Date().toISOString()
 });
}
