"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
type Leg={fixtureName:string;marketName:string;selectionName:string;oddsAtPlacement:string};
type Bet={id:string;status:string;stakeCents:number;totalOdds:string;potentialPayoutCents:number;actualPayoutCents:number|null;createdAt:string;legs:Leg[]};
const money=(n:number)=>new Intl.NumberFormat("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n/100);
export default function MyBets(){
 const [bets,setBets]=useState<Bet[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/bets",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Sign in required.");setBets(d.bets||[]);}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 return <main className="mx-auto min-h-screen max-w-5xl bg-[#080d17] px-4 py-10 text-slate-100"><Link href="/" className="text-sm text-lime-300">← SharpBets</Link><h1 className="mt-5 text-3xl font-black">My Bets</h1><p className="mb-7 text-sm text-slate-400">Your account-based virtual bet history.</p>
 {loading?<p className="text-slate-400">Loading…</p>:error?<div className="rounded-xl border border-slate-700 bg-slate-900 p-6">{error}<p className="mt-3"><Link className="text-lime-300 underline" href="/login">Sign in</Link></p></div>:bets.length? <div className="space-y-3">{bets.map(b=><article key={b.id} className="rounded-xl border border-slate-800 bg-[#101a2a] p-5"><div className="flex flex-wrap justify-between gap-3"><b>Bet #{b.id.slice(0,8)}</b><span className="rounded bg-slate-800 px-3 py-1 text-xs uppercase">{b.status}</span></div><div className="my-4 space-y-2">{b.legs.map((l,i)=><div key={i} className="flex justify-between gap-4 text-sm"><span>{l.fixtureName}<small className="block text-slate-500">{l.marketName} · {l.selectionName}</small></span><b>{Number(l.oddsAtPlacement).toFixed(2)}</b></div>)}</div><div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 text-xs sm:grid-cols-3"><span>Stake <b className="block text-sm">{money(b.stakeCents)} cr</b></span><span>Potential payout <b className="block text-sm text-lime-300">{money(b.potentialPayoutCents)} cr</b></span><span>Placed <b className="block text-sm">{new Date(b.createdAt).toLocaleString()}</b></span></div></article>)}</div>:<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No bets yet. <Link href="/" className="text-lime-300 underline">Explore the markets</Link>.</div>}
 </main>;
}
