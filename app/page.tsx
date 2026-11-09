"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Check, ChevronDown, ChevronRight, CircleUserRound, Clock3, LogOut, RefreshCw, ShieldCheck, Trophy, Wallet as WalletIcon } from "lucide-react";

type Choice={id:string;name:string;odds:string};
type Event={id:string;sportTitle:string;league:string;homeTeam:string;awayTeam:string;startTime:string;status:string;homeScore:number|null;awayScore:number|null;market:{selections:Choice[]}};
type SessionUser={id:string;name:string;email:string;role:string};
type WalletData={balanceCents:number;lastDemoCreditAt:string|null};
type Pick={selectionId:string;name:string;odds:number;fixtureId:string;fixtureName:string};
const credits=(c:number)=>new Intl.NumberFormat("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(c/100);
const time=(s:string)=>new Date(s).toLocaleString("en-KE",{dateStyle:"medium",timeStyle:"short"});

export default function Home(){
 const [health,setHealth]=useState<any>(null),[user,setUser]=useState<SessionUser|null>(null);\n const refreshMs=Math.max(60000,Number(process.env.NEXT_PUBLIC_SPORTS_REFRESH_MS||900000));
 const [events,setEvents]=useState<Event[]>([]),[wallet,setWallet]=useState<WalletData|null>(null),[bets,setBets]=useState<any[]>([]);
 const [picks,setPicks]=useState<Pick[]>([]),[stake,setStake]=useState("10"),[filter,setFilter]=useState("All sports");
 const [loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 const [menu,setMenu]=useState(false);
 const loadHealth=useCallback(async()=>{try{const r=await fetch("/api/health",{cache:"no-store"});setHealth(await r.json());}catch{setHealth({status:"offline"});}},[]);
 const loadAccount=useCallback(async()=>{try{
  const s=await fetch("/api/auth/get-session",{cache:"no-store",credentials:"include"});const data=s.ok?await s.json():null;setUser(data?.user||null);
  if(data?.user){const [w,b]=await Promise.all([fetch("/api/wallet",{cache:"no-store"}),fetch("/api/bets",{cache:"no-store"})]);if(w.ok){const v=await w.json();setWallet(v.wallet);}if(b.ok){const v=await b.json();setBets(v.bets||[]);}}
  else{setWallet(null);setBets([]);}
 }catch{setUser(null);}},[]);
 const loadEvents=useCallback(async()=>{setRefreshing(true);try{const r=await fetch("/api/sports",{cache:"no-store"});const data=await r.json();if(!r.ok)throw new Error(data.error||"Sports feed unavailable.");setEvents(data.events||[]);setNotice("");}catch(e){setNotice(e instanceof Error?e.message:"Sports feed unavailable.");}finally{setRefreshing(false);setLoading(false);}},[]);
 useEffect(()=>{void loadHealth();},[loadHealth]);
 useEffect(()=>{if(health?.capabilities?.authentication)void loadAccount();},[health,loadAccount]);
 useEffect(()=>{if(health?.capabilities?.sportsData&&health?.capabilities?.database){void loadEvents();const id=window.setInterval(()=>void loadEvents(),refreshMs);return()=>window.clearInterval(id);}else setLoading(false);},[health,loadEvents,refreshMs]);
 const sports=useMemo(()=>["All sports",...Array.from(new Set(events.map(e=>e.sportTitle))).sort()], [events]);
 const visible=events.filter(e=>(filter==="All sports"||e.sportTitle===filter));
 const totalOdds=picks.reduce((v,p)=>v*p.odds,1),stakeCents=Math.round((Number(stake)||0)*100);
 const available=wallet?.balanceCents||0;
 function toggle(e:Event,c:Choice){setPicks(old=>old.some(p=>p.selectionId===c.id)?old.filter(p=>p.selectionId!==c.id):[...old.filter(p=>p.fixtureId!==e.id),{selectionId:c.id,name:c.name,odds:Number(c.odds),fixtureId:e.id,fixtureName:e.homeTeam+" vs "+e.awayTeam}]);}
 async function placeBet(){if(!user){window.location.href="/login";return;}if(!picks.length||stakeCents<100||stakeCents>available){setNotice("Choose an outcome and enter a valid stake within your virtual balance.");return;}setBusy(true);try{const r=await fetch("/api/bets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stakeCents,selectionIds:picks.map(p=>p.selectionId)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Bet placement failed.");setNotice("Virtual bet placed successfully.");setPicks([]);await loadAccount();}catch(e){setNotice(e instanceof Error?e.message:"Bet placement failed.");}finally{setBusy(false);}}
 async function topUp(){setBusy(true);try{const r=await fetch("/api/wallet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"claim-demo-credits"})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Top-up failed.");setWallet(d.wallet);setNotice("100 virtual credits added.");}catch(e){setNotice(e instanceof Error?e.message:"Top-up failed.");}finally{setBusy(false);}}
 async function signOut(){await fetch("/api/auth/sign-out",{method:"POST"});setUser(null);setWallet(null);setBets([]);setMenu(false);}
 return <div className="min-h-screen bg-[#080d17] text-slate-100">
  <div className="border-b border-slate-800 bg-[#101a2a] px-4 py-2 text-center text-[10px] font-bold tracking-[.18em] text-lime-300"><ShieldCheck className="mr-2 inline h-3 w-3"/> SHARPBETS FREE PLAY <span className="ml-2 font-normal tracking-normal text-slate-400">Virtual credits only · No deposits or withdrawals</span></div>
  <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0b1422]/95 backdrop-blur">
   <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
    <Link href="/" className="text-2xl font-black tracking-tight">SHARP<span className="text-lime-300">BETS</span><span className="ml-2 text-[9px] font-semibold tracking-[.25em] text-slate-500">PLAY ARENA</span></Link>
    <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex"><a href="#events" className="hover:text-lime-300">Sports</a><Link href="/my-bets" className="hover:text-lime-300">My Bets</Link><Link href="/wallet" className="hover:text-lime-300">Wallet</Link><Link href="/responsible-play" className="hover:text-lime-300">Play responsibly</Link>{user?.role==="admin"&&<Link href="/admin" className="hover:text-lime-300">Admin</Link>}</nav>
    <div className="flex items-center gap-2">
     {user&&wallet?<div className="hidden rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-right sm:block"><div className="text-[9px] uppercase tracking-widest text-slate-500">Virtual balance</div><div className="font-bold text-lime-300">{credits(wallet.balanceCents)} cr</div></div>:null}
     {user?<div className="relative"><button onClick={()=>setMenu(!menu)} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm"><CircleUserRound size={16}/><span className="hidden sm:inline">{user.name}</span><ChevronDown size={14}/></button>{menu&&<div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl"><Link className="block rounded p-2 text-sm hover:bg-slate-800" href="/wallet">Wallet</Link><Link className="block rounded p-2 text-sm hover:bg-slate-800" href="/my-bets">My Bets</Link><button onClick={signOut} className="flex w-full items-center gap-2 rounded p-2 text-sm hover:bg-slate-800"><LogOut size={14}/> Sign out</button></div>}</div>:<Link href="/login" className="rounded-lg bg-lime-300 px-4 py-2 text-sm font-black text-slate-950">Sign in / Join</Link>}
    </div>
   </div>
  </header>
  <main className="mx-auto max-w-7xl px-4 py-8">
   <section className="mb-8 grid gap-6 rounded-2xl border border-blue-900/70 bg-[radial-gradient(ellipse_at_85%_0%,rgba(59,130,246,.25),transparent_45%),linear-gradient(110deg,#142a45,#0d192a)] p-6 md:grid-cols-[1.2fr_.8fr] md:p-9">
    <div><div className="mb-3 text-[10px] font-bold tracking-[.25em] text-lime-300">SPORTS, ODDS & LIVE ACTION</div><h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-5xl">The game is on.<br/><span className="text-lime-300">Make every moment count.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">Follow fixtures and market prices, build your slip and compete with virtual credits. No money is at risk.</p><div className="mt-6 flex flex-wrap gap-3"><a href="#events" className="rounded-lg bg-lime-300 px-5 py-3 text-sm font-black text-slate-950">Explore markets <ChevronRight className="ml-1 inline h-4 w-4"/></a>{!user&&<Link href="/login" className="rounded-lg border border-slate-500 px-5 py-3 text-sm font-bold">Create free account</Link>}</div></div>
    <div className="grid grid-cols-2 gap-3 self-end"><div className="rounded-xl border border-white/10 bg-black/20 p-4"><Activity className="mb-3 text-lime-300"/><div className="text-2xl font-black">{events.length}</div><div className="text-xs text-slate-400">Provider events loaded</div></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><Trophy className="mb-3 text-lime-300"/><div className="text-2xl font-black">{bets.filter(b=>b.status==="open").length}</div><div className="text-xs text-slate-400">Your open bets</div></div></div>
   </section>
   {health&&health.missing?.length>0&&<div className="mb-6 rounded-xl border border-amber-700/60 bg-amber-950/40 p-4 text-sm text-amber-100"><b>Platform setup incomplete.</b><p className="mt-1 text-amber-200/80">Connect Neon Postgres and configure the server-side sports API key before accounts, wallet and live markets can run. Missing: {(health.missing||[]).join(", ")||"service configuration"}.</p></div>}
   {notice&&<div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200"><span>{notice}</span><button onClick={()=>setNotice("")}>×</button></div>}
   <div id="events" className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><div className="text-[10px] font-bold tracking-[.2em] text-lime-300">MARKETS CENTRE</div><h2 className="mt-1 text-2xl font-black">Fixtures & odds</h2><p className="mt-1 text-xs text-slate-400">Server-fed prices · refreshes every {Math.round(refreshMs/60000)} min</p></div><button onClick={loadEvents} disabled={refreshing} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300"><RefreshCw className={refreshing?"mr-2 inline h-3 w-3 animate-spin":"mr-2 inline h-3 w-3"}/>Refresh</button></div>
   <div className="mb-5 flex gap-2 overflow-x-auto pb-2">{sports.map(s=><button key={s} onClick={()=>setFilter(s)} className={filter===s?"whitespace-nowrap rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-slate-950":"whitespace-nowrap rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300"}>{s}</button>)}</div>
   <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
    <section className="space-y-3">{loading?<div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">Loading sports feed…</div>:visible.length?visible.map(e=><article key={e.id} className="rounded-xl border border-slate-800 bg-[#101a2a] p-4 shadow-lg">
     <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400"><span className="font-bold uppercase tracking-wider">{e.sportTitle} · {e.league}</span><span className={e.status==="live"?"font-bold text-rose-400":"text-slate-400"}>{e.status==="live"?"● LIVE":"UPCOMING"} · {time(e.startTime)}</span></div>
     <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div className="font-bold">{e.homeTeam}</div><div className="text-center text-xs text-slate-500">{e.homeScore!==null&&e.awayScore!==null?<b className="text-lg text-white">{e.homeScore} : {e.awayScore}</b>:"VS"}</div><div className="text-right font-bold">{e.awayTeam}</div></div>
     <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">Match winner · Best available price</div>
     <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{e.market.selections.map(c=><button key={c.id} onClick={()=>toggle(e,c)} className={picks.some(p=>p.selectionId===c.id)?"rounded-lg border border-lime-300 bg-lime-300/10 p-3 text-left":"rounded-lg border border-slate-700 bg-[#18263a] p-3 text-left hover:border-slate-500"}><span className="block truncate text-[10px] text-slate-400">{c.name}</span><b className="mt-1 block text-base text-white">{Number(c.odds).toFixed(2)}</b></button>)}</div>
    </article>):<div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center"><Trophy className="mx-auto mb-3 text-slate-600"/><b>No provider fixtures available</b><p className="mt-2 text-xs text-slate-500">{notice||"Try refreshing or check back later."}</p></div>}</section>
    <aside className="h-fit rounded-xl border border-slate-700 bg-[#101a2a] p-5 lg:sticky lg:top-28"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-black">Bet slip <span className="text-sm text-slate-400">({picks.length})</span></h3><span className="rounded bg-lime-300/10 px-2 py-1 text-[9px] font-bold tracking-widest text-lime-300">VIRTUAL</span></div>
     {!picks.length?<div className="rounded-lg border border-dashed border-slate-700 p-7 text-center text-xs text-slate-500">Choose an outcome to start building your slip.</div>:<div className="mb-4 space-y-2">{picks.map(p=><div key={p.selectionId} className="flex items-start justify-between gap-3 rounded-lg bg-slate-900 p-3"><div><b className="block text-xs">{p.fixtureName}</b><span className="text-[10px] text-slate-400">{p.name} · {p.odds.toFixed(2)}</span></div><button onClick={()=>setPicks(old=>old.filter(x=>x.selectionId!==p.selectionId))} className="text-slate-500">×</button></div>)}</div>}
     <label className="mb-2 block text-xs text-slate-400">Stake (virtual credits)<input type="number" min="1" max="5000" value={stake} onChange={e=>setStake(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
     <div className="my-3 flex gap-2">{[5,10,25,50].map(n=><button key={n} onClick={()=>setStake(String(n))} className="flex-1 rounded border border-slate-700 py-2 text-xs">{n}</button>)}</div>
     <div className="flex justify-between border-t border-slate-700 py-3 text-xs"><span className="text-slate-400">Combined odds</span><b>{picks.length?totalOdds.toFixed(2):"—"}</b></div><div className="flex justify-between pb-4 text-xs"><span className="text-slate-400">Potential payout</span><b className="text-lime-300">{picks.length?credits(Math.floor(stakeCents*totalOdds))+" cr":"—"}</b></div>
     <div className="mb-3 flex justify-between text-[10px] text-slate-400"><span>Available balance</span><b>{wallet?credits(available)+" cr":"Sign in to view"}</b></div>
     <button disabled={busy||!picks.length||!user||stakeCents<100||stakeCents>available} onClick={placeBet} className="w-full rounded-lg bg-lime-300 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{busy?"Processing…":user?"Place virtual bet":"Sign in to place a bet"}</button>
     {!user&&<Link href="/login" className="mt-3 block text-center text-xs text-lime-300 underline">Sign in or create an account</Link>}
     <p className="mt-3 text-center text-[9px] text-slate-500">Virtual credits only. No cash value or withdrawals.</p>
    </aside>
   </div>
  </main>
  <footer className="mt-12 border-t border-slate-800 bg-[#0b1422] px-4 py-8"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 text-xs text-slate-500"><span>© 2026 SharpBets · Free-play sportsbook</span><div className="flex gap-4"><Link href="/responsible-play">Responsible play</Link><Link href="/my-bets">My Bets</Link><Link href="/wallet">Wallet</Link></div></div></footer>
 </div>;
}
