import { NextResponse } from "next/server";
import { and,eq,gte,inArray,sum } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { betLegs,bets,fixtures,markets,responsibleLimits,selections,walletLedger,wallets } from "@/lib/db/schema";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const session=await getAuth().api.getSession({headers:request.headers});if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
 const db=getDb(),records=await db.select().from(bets).where(eq(bets.userId,session.user.id)).orderBy(bets.createdAt);
 const result=await Promise.all(records.map(async bet=>({...bet,legs:await db.select().from(betLegs).where(eq(betLegs.betId,bet.id))})));
 return NextResponse.json({bets:result});
}
export async function POST(request:Request){
 const session=await getAuth().api.getSession({headers:request.headers});if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
 const body=await request.json().catch(()=>({})),stake=Number(body.stakeCents);
 const ids=Array.isArray(body.selectionIds)?[...new Set(body.selectionIds.filter((v:unknown)=>typeof v==="string"))] as string[]:[];
 if(!Number.isSafeInteger(stake)||stake<100||stake>500000||ids.length<1||ids.length>10)return NextResponse.json({error:"Stake must be 1–5,000 virtual credits; select 1–10 unique outcomes."},{status:400});
 const db=getDb();
 try{
  const bet=await db.transaction(async tx=>{
   const now=new Date();
   let [limits]=await tx.select().from(responsibleLimits).where(eq(responsibleLimits.userId,session.user.id)).for("update").limit(1);
   if(!limits)[limits]=await tx.insert(responsibleLimits).values({id:crypto.randomUUID(),userId:session.user.id}).returning();
   if(limits.coolOffUntil&&limits.coolOffUntil>now)throw new Error("Your cool-off period is active.");
   if(limits.selfExcludedUntil&&limits.selfExcludedUntil>now)throw new Error("Your self-exclusion period is active.");
   const start=new Date(now);start.setUTCHours(0,0,0,0);
   const [spent]=await tx.select({total:sum(bets.stakeCents)}).from(bets).where(and(eq(bets.userId,session.user.id),gte(bets.createdAt,start)));
   if(Number(spent?.total||0)+stake>limits.dailyStakeLimitCents)throw new Error("Your daily virtual stake limit would be exceeded.");
   let [wallet]=await tx.select().from(wallets).where(eq(wallets.userId,session.user.id)).for("update").limit(1);
   if(!wallet)[wallet]=await tx.insert(wallets).values({id:crypto.randomUUID(),userId:session.user.id,balanceCents:100000}).returning();
   if(wallet.balanceCents<stake)throw new Error("Insufficient virtual-credit balance.");
   const rows=await tx.select({selectionId:selections.id,selectionName:selections.name,odds:selections.odds,marketName:markets.name,marketActive:markets.active,home:fixtures.homeTeam,away:fixtures.awayTeam,status:fixtures.status})
    .from(selections).innerJoin(markets,eq(selections.marketId,markets.id)).innerJoin(fixtures,eq(markets.fixtureId,fixtures.id)).where(inArray(selections.id,ids));
   if(rows.length!==ids.length)throw new Error("A selection is no longer available.");
   if(rows.some(r=>!r.marketActive||["finished","cancelled"].includes(r.status)))throw new Error("A selected market is closed.");
   const totalOdds=rows.reduce((v,r)=>v*Number(r.odds),1);if(!Number.isFinite(totalOdds)||totalOdds<=1)throw new Error("Invalid odds.");
   const payout=Math.floor(stake*totalOdds),id=crypto.randomUUID(),balance=wallet.balanceCents-stake;
   await tx.update(wallets).set({balanceCents:balance,updatedAt:now}).where(eq(wallets.id,wallet.id));
   await tx.insert(bets).values({id,userId:session.user.id,status:"open",stakeCents:stake,totalOdds:totalOdds.toFixed(4),potentialPayoutCents:payout});
   await tx.insert(betLegs).values(rows.map(r=>({id:crypto.randomUUID(),betId:id,selectionId:r.selectionId,fixtureName:r.home+" vs "+r.away,marketName:r.marketName,selectionName:r.selectionName,oddsAtPlacement:Number(r.odds).toFixed(3),result:"pending"})));
   await tx.insert(walletLedger).values({id:crypto.randomUUID(),userId:session.user.id,type:"bet_stake",amountCents:-stake,balanceAfterCents:balance,referenceId:id,idempotencyKey:"stake:"+id,note:"Virtual bet stake"});
   return {id,stakeCents:stake,totalOdds,potentialPayoutCents:payout,balanceAfterCents:balance,status:"open"};
  });
  return NextResponse.json({bet},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Bet could not be placed."},{status:409});}
}
