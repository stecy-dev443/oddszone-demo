import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { auditLogs,fixtures,markets,selections } from "@/lib/db/schema";
export const dynamic="force-dynamic";
async function admin(request:Request){const s=await getAuth().api.getSession({headers:request.headers});return s?.user.role==="admin"?s:null;}
export async function GET(request:Request){
 const s=await admin(request);if(!s)return NextResponse.json({error:"Admin access required."},{status:403});
 const db=getDb(),all=await db.select().from(fixtures).orderBy(fixtures.startTime);
 const result=await Promise.all(all.map(async f=>{
  const ms=await db.select().from(markets).where(eq(markets.fixtureId,f.id));
  const nested=await Promise.all(ms.map(async m=>({...m,selections:await db.select().from(selections).where(eq(selections.marketId,m.id))})));
  return {...f,markets:nested};
 }));
 return NextResponse.json({fixtures:result});
}
export async function PATCH(request:Request){
 const s=await admin(request);if(!s)return NextResponse.json({error:"Admin access required."},{status:403});
 const b=await request.json().catch(()=>({}));
 if(typeof b.fixtureId!=="string"||!["upcoming","live","finished","cancelled"].includes(b.status))return NextResponse.json({error:"fixtureId and valid status required."},{status:400});
 const db=getDb();const [f]=await db.update(fixtures).set({status:b.status,homeScore:Number.isInteger(b.homeScore)?b.homeScore:undefined,awayScore:Number.isInteger(b.awayScore)?b.awayScore:undefined,updatedAt:new Date()}).where(eq(fixtures.id,b.fixtureId)).returning();
 if(!f)return NextResponse.json({error:"Fixture not found."},{status:404});
 await db.insert(auditLogs).values({id:crypto.randomUUID(),actorUserId:s.user.id,action:"fixture.update",entityType:"fixture",entityId:f.id,details:{status:f.status,homeScore:f.homeScore,awayScore:f.awayScore}});
 return NextResponse.json({fixture:f});
}
