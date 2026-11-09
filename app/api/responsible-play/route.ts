import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { responsibleLimits } from "@/lib/db/schema";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const s=await getAuth().api.getSession({headers:request.headers});if(!s)return NextResponse.json({error:"Sign in required."},{status:401});
 const db=getDb();let [limits]=await db.select().from(responsibleLimits).where(eq(responsibleLimits.userId,s.user.id)).limit(1);
 if(!limits)[limits]=await db.insert(responsibleLimits).values({id:crypto.randomUUID(),userId:s.user.id}).returning();
 return NextResponse.json({limits});
}
export async function PUT(request:Request){
 const s=await getAuth().api.getSession({headers:request.headers});if(!s)return NextResponse.json({error:"Sign in required."},{status:401});
 const b=await request.json().catch(()=>({})),daily=Number(b.dailyStakeLimitCents),minutes=Number(b.sessionMinutes);
 if(!Number.isSafeInteger(daily)||daily<100||daily>500000||![15,30,60,90,120].includes(minutes))return NextResponse.json({error:"Choose a daily stake limit from 1 to 5,000 credits and a supported reminder interval."},{status:400});
 const now=new Date(),cool=Number(b.coolOffHours||0),exclude=Number(b.selfExcludeDays||0);
 if(![0,24,48,72,168,720].includes(cool)||![0,1,7,30,90,365].includes(exclude))return NextResponse.json({error:"Invalid cool-off or self-exclusion duration."},{status:400});
 const db=getDb();const [old]=await db.select().from(responsibleLimits).where(eq(responsibleLimits.userId,s.user.id)).limit(1);
 if(old&&daily>old.dailyStakeLimitCents)return NextResponse.json({error:"Daily stake limits can be reduced immediately, but increases are locked in this prototype. Contact support if you need a review."},{status:409});
 const preserve=(existing:Date|null,requested:Date|null)=>existing&&existing>now&&(!requested||requested<existing)?existing:requested;
 const values={dailyStakeLimitCents:daily,sessionMinutes:minutes,coolOffUntil:preserve(old?.coolOffUntil||null,cool?new Date(now.getTime()+cool*3600000):null),selfExcludedUntil:preserve(old?.selfExcludedUntil||null,exclude?new Date(now.getTime()+exclude*86400000):null),updatedAt:now};
 const [limits]=old?await db.update(responsibleLimits).set(values).where(eq(responsibleLimits.userId,s.user.id)).returning():await db.insert(responsibleLimits).values({id:crypto.randomUUID(),userId:s.user.id,...values}).returning();
 return NextResponse.json({limits});
}
