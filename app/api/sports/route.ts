import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { fixtures,markets,selections } from "@/lib/db/schema";
export const dynamic="force-dynamic";
type Event={id:string;sport_key:string;sport_title:string;commence_time:string;home_team:string;away_team:string;bookmakers?:Array<{markets?:Array<{key:string;outcomes?:Array<{name:string;price:number}>}>}>};
type ScoreEvent={id:string;completed?:boolean;scores?:Array<{name:string;score:string}>};
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
export async function GET(){
 if(!process.env.DATABASE_URL)return NextResponse.json({provider:"not_configured",events:[],error:"Database is not connected."},{status:503});
 const key=process.env.ODDS_API_KEY;if(!key)return NextResponse.json({provider:"not_configured",events:[],error:"ODDS_API_KEY is not configured."},{status:503});
 try{
  const url=new URL("https://api.the-odds-api.com/v4/sports/upcoming/odds");
  url.searchParams.set("apiKey",key);url.searchParams.set("regions",process.env.ODDS_API_REGIONS||"eu");url.searchParams.set("markets","h2h");url.searchParams.set("oddsFormat","decimal");
  const cacheSeconds=Math.max(60,Math.min(21600,Number(process.env.SPORTS_CACHE_SECONDS||900)));
  const response=await fetch(url,{next:{revalidate:cacheSeconds}});if(!response.ok)throw new Error("Sports provider returned HTTP "+response.status);
  const events=(await response.json()) as Event[],db=getDb(),scoreMap=new Map<string,ScoreEvent>();
  const sportKeys=[...new Set(events.map(e=>e.sport_key))].slice(0,3);
  await Promise.all(sportKeys.map(async sport=>{
   try{
    const scoreUrl=new URL("https://api.the-odds-api.com/v4/sports/"+encodeURIComponent(sport)+"/scores");
    scoreUrl.searchParams.set("apiKey",key);scoreUrl.searchParams.set("daysFrom","1");
    const scoreResponse=await fetch(scoreUrl,{next:{revalidate:cacheSeconds}});
    if(scoreResponse.ok){const scores=(await scoreResponse.json()) as ScoreEvent[];for(const score of scores)scoreMap.set(score.id,score);}
   }catch{/* Score coverage varies by sport; odds remain available. */}
  }));
  const out=[];
  for(const e of events){
   const start=new Date(e.commence_time);if(!Number.isFinite(start.getTime()))continue;
   const score=scoreMap.get(e.id),homeScore=score?.scores?.find(s=>s.name===e.home_team)?.score,awayScore=score?.scores?.find(s=>s.name===e.away_team)?.score;
   const hs=homeScore!==undefined?Number.parseInt(homeScore,10):null,as=awayScore!==undefined?Number.parseInt(awayScore,10):null;
   const status=score?.completed?"finished":start.getTime()<=Date.now()?"live":"upcoming";
   const [fixture]=await db.insert(fixtures).values({id:"evt_"+e.id,externalId:e.id,sportKey:e.sport_key,sportTitle:e.sport_title,league:e.sport_title,homeTeam:e.home_team,awayTeam:e.away_team,startTime:start,status,homeScore:Number.isFinite(hs)?hs:null,awayScore:Number.isFinite(as)?as:null,lastSyncedAt:new Date()})
    .onConflictDoUpdate({target:fixtures.externalId,set:{sportKey:e.sport_key,sportTitle:e.sport_title,homeTeam:e.home_team,awayTeam:e.away_team,startTime:start,status,homeScore:Number.isFinite(hs)?hs:null,awayScore:Number.isFinite(as)?as:null,lastSyncedAt:new Date(),updatedAt:new Date()}}).returning();
   const [market]=await db.insert(markets).values({id:"mkt_"+e.id,fixtureId:fixture.id,externalKey:"h2h",name:"Match winner",active:status!=="finished"})
    .onConflictDoUpdate({target:[markets.fixtureId,markets.externalKey],set:{active:status!=="finished",updatedAt:new Date()}}).returning();
   const prices=new Map<string,number>();
   for(const b of e.bookmakers||[])for(const m of b.markets||[])if(m.key==="h2h")for(const o of m.outcomes||[])if(Number.isFinite(o.price)&&o.price>1)prices.set(o.name,Math.max(prices.get(o.name)||0,o.price));
   const choices=[];
   for(const [name,price] of prices){
    const [choice]=await db.insert(selections).values({id:"sel_"+e.id+"_"+slug(name),marketId:market.id,name,odds:price.toFixed(3),active:status!=="finished"})
     .onConflictDoUpdate({target:[selections.marketId,selections.name],set:{odds:price.toFixed(3),active:status!=="finished",updatedAt:new Date()}}).returning();
    choices.push(choice);
   }
   out.push({...fixture,market:{...market,selections:choices}});
  }
  return NextResponse.json({provider:"the-odds-api",updatedAt:new Date().toISOString(),events:out});
 }catch(err){return NextResponse.json({provider:"the-odds-api",events:[],error:err instanceof Error?err.message:"Feed unavailable."},{status:502});}
}
