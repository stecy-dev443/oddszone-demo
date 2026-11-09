import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { wallets,walletLedger } from "@/lib/db/schema";
export const dynamic="force-dynamic";
const START=100000,TOPUP=10000;
export async function GET(request:Request){
 const session=await getAuth().api.getSession({headers:request.headers});
 if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
 const db=getDb();let [wallet]=await db.select().from(wallets).where(eq(wallets.userId,session.user.id)).limit(1);
 if(!wallet){
  [wallet]=await db.insert(wallets).values({id:crypto.randomUUID(),userId:session.user.id,balanceCents:START}).returning();
  await db.insert(walletLedger).values({id:crypto.randomUUID(),userId:session.user.id,type:"welcome_credits",amountCents:START,balanceAfterCents:START,idempotencyKey:"welcome:"+session.user.id,note:"Initial free virtual credits"}).onConflictDoNothing();
 }
 const ledger=await db.select().from(walletLedger).where(eq(walletLedger.userId,session.user.id)).orderBy(walletLedger.createdAt).limit(50);
 return NextResponse.json({wallet,ledger,currency:"VIRTUAL_CREDITS"});
}
export async function POST(request:Request){
 const session=await getAuth().api.getSession({headers:request.headers});
 if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
 const body=await request.json().catch(()=>({}));
 if(body.action!=="claim-demo-credits")return NextResponse.json({error:"Only free virtual-credit top-ups are available. Payments are disabled."},{status:400});
 const db=getDb();
 try{
  const wallet=await db.transaction(async tx=>{
   let [w]=await tx.select().from(wallets).where(eq(wallets.userId,session.user.id)).for("update").limit(1);
   if(!w)[w]=await tx.insert(wallets).values({id:crypto.randomUUID(),userId:session.user.id,balanceCents:START}).returning();
   const now=new Date();
   if(w.lastDemoCreditAt&&now.getTime()-w.lastDemoCreditAt.getTime()<86400000)throw new Error("Daily free-credit top-up already used.");
   const balance=w.balanceCents+TOPUP;
   const [updated]=await tx.update(wallets).set({balanceCents:balance,lastDemoCreditAt:now,updatedAt:now}).where(eq(wallets.id,w.id)).returning();
   await tx.insert(walletLedger).values({id:crypto.randomUUID(),userId:session.user.id,type:"demo_credit",amountCents:TOPUP,balanceAfterCents:balance,idempotencyKey:"topup:"+session.user.id+":"+now.toISOString().slice(0,10),note:"Daily free virtual-credit allowance"}).onConflictDoNothing();
   return updated;
  });
  return NextResponse.json({wallet});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Top-up failed."},{status:409});}
}
