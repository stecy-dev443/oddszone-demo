import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { fixtures,markets,selections } from "@/lib/db/schema";
export const dynamic="force-dynamic";
type Event={id:string;sport_key:string;sport_title:string;commence_time:string;home_team:string;away_team:string;bookmakers?:Array<{markets?:Array<{key:string;outcomes?:Array<{name:string;price:number}>}>}>};
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
export async function GET(){
 if(!process.env.DATABASE_URL)return NextResponse.json({provider:"not_configured",events:[],error:"Database is not connected."},{status:503});
 if(!process.env.ODDS_API_KEY)return NextResponse.json({provider:"not_configured",events:[],error:"ODDS_API_KEY is not configured."},{status:503});
 try{
  const url=new URL("https://api.the-odds-api.com/v4/sports/upcoming/odds");
  url.searchParams.set("apiKey",process.env.ODDS_API_KEY);
  url.searchParams.set("regions",process.env.ODDS_API_REGIONS||"eu,uk");
  url.searchParams.set("markets","h2h");url.searchParams.set("oddsFormat","decimal");
  const response=await fetch(url,{next:{revalidate:25}});
  if(!response.ok)throw new Error("Sports provider returned HTTP "+response.status);
  const events=(await response.json()) as Event[],db=getDb(),out=[];
  for(const e of events){
   const start=new Date(e.commence_time);if(!Number.isFinite(start.getTime()))continue;
   const [fixture]=await db.insert(fixtures).values({id:"evt_"+e.id,externalId:e.id,sportKey:e.sport_key,sportTitle:e.sport_title,league:e.sport_title,homeTeam:e.home_team,awayTeam:e.away_team,startTime:start,status:start.getTime()<=Date.now()?"live":"upcoming",lastSyncedAt:new Date()})
    .onConflictDoUpdate({target:fixtures.externalId,set:{sportKey:e.sport_key,sportTitle:e.sport_title,homeTeam:e.home_team,awayTeam:e.away_team,startTime:start,lastSyncedAt:new Date(),updatedAt:new Date()}}).returning();
   const [market]=await db.insert(markets).values({id:"mkt_"+e.id,fixtureId:fixture.id,externalKey:"h2h",name:"Match winner",active:true})
    .onConflictDoUpdate({target:[markets.fixtureId,markets.externalKey],set:{active:true,updatedAt:new Date()}}).returning();
   const prices=new Map<string,number>();
   for(const b of e.bookmakers||[])for(const m of b.markets||[])if(m.key==="h2h")for(const o of m.outcomes||[])if(Number.isFinite(o.price)&&o.price>1)prices.set(o.name,Math.max(prices.get(o.name)||0,o.price));
   const choices=[];
   for(const [name,price] of prices){
    const [choice]=await db.insert(selections).values({id:"sel_"+e.id+"_"+slug(name),marketId:market.id,name,odds:price.toFixed(3),active:true})
     .onConflictDoUpdate({target:[selections.marketId,selections.name],set:{odds:price.toFixed(3),active:true,updatedAt:new Date()}}).returning();
    choices.push(choice);
   }
   out.push({...fixture,market:{...market,selections:choices}});
  }
  return NextResponse.json({provider:"the-odds-api",updatedAt:new Date().toISOString(),events:out});
 }catch(err){return NextResponse.json({provider:"the-odds-api",events:[],error:err instanceof Error?err.message:"Feed unavailable."},{status:502});}
}
