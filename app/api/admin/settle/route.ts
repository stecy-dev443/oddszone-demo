import { NextResponse } from "next/server";
import { eq,inArray } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { auditLogs,betLegs,bets,fixtures,markets,selections,walletLedger,wallets } from "@/lib/db/schema";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 const session=await getAuth().api.getSession({headers:request.headers});
 if(!session||session.user.role!=="admin")return NextResponse.json({error:"Admin access required."},{status:403});
 const body=await request.json().catch(()=>({}));
 if(typeof body.fixtureId!=="string"||(!body.void&&typeof body.winningSelectionId!=="string"))return NextResponse.json({error:"fixtureId and winningSelectionId (or void:true) are required."},{status:400});
 try{
  const result=await getDb().transaction(async tx=>{
   const [fixture]=await tx.select().from(fixtures).where(eq(fixtures.id,body.fixtureId)).limit(1);
   if(!fixture)throw new Error("Fixture not found.");
   const marketRows=await tx.select({selectionId:selections.id}).from(selections).innerJoin(markets,eq(selections.marketId,markets.id)).where(eq(markets.fixtureId,fixture.id));
   const ids=marketRows.map(x=>x.selectionId);
   if(!ids.length)throw new Error("No market selections exist for this fixture.");
   if(!body.void&&!ids.includes(body.winningSelectionId))throw new Error("Winning selection does not belong to this fixture.");
   await tx.update(betLegs).set({result:body.void?"void":undefined}).where(inArray(betLegs.selectionId,ids));
   if(!body.void){
    for(const selectionId of ids)await tx.update(betLegs).set({result:selectionId===body.winningSelectionId?"won":"lost"}).where(eq(betLegs.selectionId,selectionId));
   }
   const related=await tx.select({betId:betLegs.betId}).from(betLegs).where(inArray(betLegs.selectionId,ids));
   const betIds=[...new Set(related.map(x=>x.betId))];
   let settled=0,paid=0;
   for(const betId of betIds){
    const [bet]=await tx.select().from(bets).where(eq(bets.id,betId)).limit(1);
    if(!bet||bet.status!=="open")continue;
    const legs=await tx.select().from(betLegs).where(eq(betLegs.betId,betId));
    if(legs.some(l=>l.result==="lost")){await tx.update(bets).set({status:"lost",settledAt:new Date(),actualPayoutCents:0}).where(eq(bets.id,betId));settled++;continue;}
    if(legs.every(l=>l.result!=="pending")){
     const allVoid=legs.every(l=>l.result==="void");
     const odds=legs.reduce((v,l)=>v*(l.result==="void"?1:Number(l.oddsAtPlacement)),1);
     const payout=allVoid?bet.stakeCents:Math.floor(bet.stakeCents*odds);
     await tx.update(bets).set({status:"won",settledAt:new Date(),actualPayoutCents:payout}).where(eq(bets.id,betId));
     if(payout>0){
      const [wallet]=await tx.select().from(wallets).where(eq(wallets.userId,bet.userId)).for("update").limit(1);
      if(wallet){const balance=wallet.balanceCents+payout;await tx.update(wallets).set({balanceCents:balance,updatedAt:new Date()}).where(eq(wallets.id,wallet.id));
       await tx.insert(walletLedger).values({id:crypto.randomUUID(),userId:bet.userId,type:"bet_settlement",amountCents:payout,balanceAfterCents:balance,referenceId:betId,idempotencyKey:"settlement:"+betId,note:allVoid?"Voided bet stake returned":"Winning virtual bet payout"}).onConflictDoNothing();paid+=payout;}
     }
     settled++;
    }
   }
   await tx.update(fixtures).set({status:"finished",updatedAt:new Date()}).where(eq(fixtures.id,fixture.id));
   await tx.update(markets).set({active:false,updatedAt:new Date()}).where(eq(markets.fixtureId,fixture.id));
   await tx.insert(auditLogs).values({id:crypto.randomUUID(),actorUserId:session.user.id,action:"fixture.settle",entityType:"fixture",entityId:fixture.id,details:{void:Boolean(body.void),winningSelectionId:body.winningSelectionId||null,settledBets:settled}});
   return {fixtureId:fixture.id,settledBets:settled,payoutCents:paid};
  });
  return NextResponse.json(result);
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Settlement failed."},{status:409});}
}
