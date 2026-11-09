"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Check, ChevronDown, ChevronRight,
  Gift, Menu, Moon, Search, ShieldCheck, SlidersHorizontal,
  Sun, Trophy, UserRound, Wallet, X, Zap
} from "lucide-react";

type Sport = "Football" | "Basketball" | "Tennis" | "Baseball" | "Esports";
type Match = {
  id: number; sport: Sport; league: string; home: string; away: string;
  score: [number, number]; clock: string; status: "LIVE" | "UPCOMING";
  odds: [number, number, number]; moves: [string, string, string];
  stats: string;
};
type Pick = { matchId: number; outcome: number; odds: number };
type Bet = {
  id: number; picks: Pick[]; stake: number; payout: number;
  status: "Open" | "Won" | "Lost" | "Cashed out"; date: string;
};

const seedMatches: Match[] = [
  {id:1,sport:"Football",league:"Premier League · England",home:"Arsenal",away:"Chelsea",score:[2,1],clock:"67′",status:"LIVE",odds:[1.72,3.55,4.65],moves:["","",""],stats:"Possession 58% · Shots 13–8"},
  {id:2,sport:"Football",league:"La Liga · Spain",home:"Real Madrid",away:"Barcelona",score:[1,1],clock:"52′",status:"LIVE",odds:[2.05,2.95,3.35],moves:["","",""],stats:"Possession 49% · Shots 7–9"},
  {id:3,sport:"Basketball",league:"NBA · USA",home:"Boston Celtics",away:"New York Knicks",score:[78,72],clock:"Q3 · 04:32",status:"LIVE",odds:[1.48,0,2.62],moves:["","",""],stats:"Rebounds 31–27 · Assists 18–16"},
  {id:4,sport:"Tennis",league:"ATP · Indoor",home:"Alex de Minaur",away:"Taylor Fritz",score:[1,0],clock:"Set 2 · 3–2",status:"LIVE",odds:[1.66,0,2.18],moves:["","",""],stats:"Aces 5–7 · Break points 2–1"},
  {id:5,sport:"Football",league:"Serie A · Italy",home:"Inter Milan",away:"Napoli",score:[0,0],clock:"28′",status:"LIVE",odds:[2.12,2.78,3.7],moves:["","",""],stats:"Possession 54% · Shots 4–3"},
  {id:6,sport:"Baseball",league:"MLB · USA",home:"LA Dodgers",away:"San Diego Padres",score:[3,2],clock:"Top 6th",status:"LIVE",odds:[1.62,0,2.3],moves:["","",""],stats:"Hits 7–5 · Errors 0–1"},
  {id:7,sport:"Esports",league:"Valorant · Masters",home:"Sentinels",away:"Fnatic",score:[8,6],clock:"Map 2",status:"LIVE",odds:[1.82,0,1.94],moves:["","",""],stats:"Maps 1–0 · Rounds 8–6"},
  {id:8,sport:"Football",league:"Bundesliga · Germany",home:"Bayern Munich",away:"Borussia Dortmund",score:[1,0],clock:"39′",status:"LIVE",odds:[1.58,3.9,5.1],moves:["","",""],stats:"Possession 62% · Shots 9–3"},
  {id:9,sport:"Basketball",league:"EuroLeague",home:"Real Madrid Baloncesto",away:"Olympiacos",score:[42,46],clock:"Q2 · 01:18",status:"LIVE",odds:[2.35,0,1.55],moves:["","",""],stats:"Rebounds 18–22 · Fouls 8–7"},
  {id:10,sport:"Tennis",league:"WTA · Clay",home:"Iga Swiatek",away:"Coco Gauff",score:[0,0],clock:"Set 1 · 2–2",status:"LIVE",odds:[1.52,0,2.48],moves:["","",""],stats:"Aces 1–2 · Winners 8–6"},
  {id:11,sport:"Football",league:"Ligue 1 · France",home:"PSG",away:"Marseille",score:[0,0],clock:"Tomorrow · 20:00",status:"UPCOMING",odds:[1.64,3.8,4.7],moves:["","",""],stats:"Head-to-head 4–1–1"},
  {id:12,sport:"Baseball",league:"MLB · USA",home:"New York Yankees",away:"Boston Red Sox",score:[0,0],clock:"Tomorrow · 19:10",status:"UPCOMING",odds:[1.88,0,1.92],moves:["","",""],stats:"Season series 3–2"}
];

const sports = ["Live Now","Football","Basketball","Tennis","Baseball","Esports","Upcoming"] as const;
const outcomeNames = ["Home","Draw","Away"];

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
}
const fmt = (n: number) => n.toLocaleString("en-US", {maximumFractionDigits: 2});

export default function Home() {
  const [matches,setMatches] = useState(seedMatches);
  const [activeSport,setActiveSport] = useState<string>("Live Now");
  const [query,setQuery] = useState("");
  const [balance,setBalance] = useState(10000);
  const [picks,setPicks] = useState<Pick[]>([]);
  const [stake,setStake] = useState("10");
  const [bets,setBets] = useState<Bet[]>([]);
  const [section,setSection] = useState<"sports"|"bets">("sports");
  const [betTab,setBetTab] = useState<"Open"|"Settled"|"Cash Out">("Open");
  const [slipOpen,setSlipOpen] = useState(false);
  const [profileOpen,setProfileOpen] = useState(false);
  const [creditsOpen,setCreditsOpen] = useState(false);
  const [responsibleOpen,setResponsibleOpen] = useState(false);
  const [theme,setTheme] = useState<"dark"|"light">("dark");
  const [message,setMessage] = useState("");
  const [limits,setLimits] = useState({daily:1000,session:60});
  const [playPaused,setPlayPaused] = useState(false);
  const [selfExcluded,setSelfExcluded] = useState(false);

  useEffect(() => {
    setBalance(readStore("sb-balance",10000));
    setBets(readStore("sb-bets",[]));
    setTheme(readStore<"dark"|"light">("sb-theme","dark"));
    setPlayPaused(readStore("sb-paused",false));
    setSelfExcluded(readStore("sb-self-excluded",false));
  }, []);
  useEffect(() => { localStorage.setItem("sb-balance",String(balance)); },[balance]);
  useEffect(() => { localStorage.setItem("sb-bets",JSON.stringify(bets)); },[bets]);
  useEffect(() => { localStorage.setItem("sb-theme",JSON.stringify(theme)); },[theme]);
  useEffect(() => { localStorage.setItem("sb-paused",JSON.stringify(playPaused)); },[playPaused]);
  useEffect(() => { localStorage.setItem("sb-self-excluded",JSON.stringify(selfExcluded)); },[selfExcluded]);
  useEffect(() => {
    const timer = window.setInterval(() => setMessage("Session reminder: consider taking a short break."), limits.session*60*1000);
    return () => window.clearInterval(timer);
  },[limits.session]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMatches(old => old.map(m => {
        const next = m.odds.map(o => o===0 ? 0 : Math.max(1.08, +(o + (Math.random()-.5)*.12).toFixed(2))) as [number,number,number];
        const moves = next.map((o,i) => o===0 ? "" : o>m.odds[i] ? "up" : o<m.odds[i] ? "down" : "") as [string,string,string];
        return {...m,odds:next,moves};
      }));
    },3500);
    return () => window.clearInterval(timer);
  },[]);

  const filtered = useMemo(() => matches.filter(m => {
    const category = activeSport==="Live Now" ? m.status==="LIVE" : activeSport==="Upcoming" ? m.status==="UPCOMING" : m.sport===activeSport;
    const text = (m.home+" "+m.away+" "+m.league).toLowerCase();
    return category && text.includes(query.toLowerCase());
  }),[matches,activeSport,query]);
  const featured = matches[0];
  const combined = picks.reduce((v,p)=>v*p.odds,1);
  const numericStake = Math.max(0,Number(stake)||0);
  const potential = numericStake*combined;
  const selectedIds = new Set(picks.map(p=>p.matchId));
  const visibleBets = bets.filter(b => betTab==="Open" ? b.status==="Open" : betTab==="Settled" ? b.status!=="Open" : b.status==="Open");

  function togglePick(match: Match, outcome: number) {
    if (match.odds[outcome]===0) return;
    setPicks(old => {
      const exists = old.find(p=>p.matchId===match.id);
      if (exists?.outcome===outcome) return old.filter(p=>p.matchId!==match.id);
      return [...old.filter(p=>p.matchId!==match.id),{matchId:match.id,outcome,odds:match.odds[outcome]}];
    });
    setSlipOpen(true);
  }
  function placeBet() {
    if (!picks.length || numericStake<=0 || numericStake>balance) { setMessage("Choose an outcome and enter a valid stake within your virtual balance."); return; }
    const bet: Bet = {id:Date.now(),picks:[...picks],stake:numericStake,payout:potential,status:"Open",date:new Date().toLocaleString()};
    setBets(old=>[bet,...old]); setBalance(v=>v-numericStake); setPicks([]); setStake("10"); setMessage("Your virtual bet has been placed."); setSlipOpen(false);
  }
  function settleDemo() {
    const next = bets.map(b => b.status!=="Open" ? b : {...b,status:(Math.random()>.5?"Won":"Lost") as Bet["status"]});
    next.forEach((b,i)=>{if(b.status==="Won"&&bets[i]?.status==="Open") setBalance(v=>v+b.payout);});
    setBets(next); setMessage("Demo results have been simulated.");
  }
  function cashOut(bet: Bet) {
    const amount = Math.max(1,Math.round(bet.stake*0.82*100)/100);
    setBets(old=>old.map(b=>b.id===bet.id?{...b,status:"Cashed out"}:b));
    setBalance(v=>v+amount); setMessage("Virtual cash out credited: "+fmt(amount)+" credits.");
  }

  const MatchCard = ({match}: {match:Match}) => (
    <article className="match-card">
      <div className="match-meta"><span>{match.sport} <span className="meta-dot">·</span> {match.league}</span>
        {match.status==="LIVE" ? <span className="live-label"><i/> LIVE <b>{match.clock}</b></span> : <span className="upcoming-label">{match.clock}</span>}
      </div>
      <div className="teams-line">
        <div className="team-side"><span className="team-mark">{match.home.slice(0,2).toUpperCase()}</span><b>{match.home}</b></div>
        <div className="score-box"><strong>{match.score[0]} <small>:</small> {match.score[1]}</strong></div>
        <div className="team-side away"><b>{match.away}</b><span className="team-mark">{match.away.slice(0,2).toUpperCase()}</span></div>
      </div>
      <div className="match-stats"><Activity size={13}/>{match.stats}</div>
      <div className="market-head"><span>Match result</span><span>Decimal odds</span></div>
      <div className="odds-grid">{match.odds.map((odd,i)=>(
        <button key={i} disabled={odd===0} onClick={()=>togglePick(match,i)}
          className={`odd-button ${selectedIds.has(match.id)&&picks.find(p=>p.matchId===match.id)?.outcome===i?"chosen":""} ${match.moves[i]}`}>
          <span>{outcomeNames[i]}</span><b>{odd===0?"—":odd.toFixed(2)}</b>
          {match.moves[i]==="up"&&<ArrowUpRight size={12}/>}
          {match.moves[i]==="down"&&<ArrowDownRight size={12}/>}
        </button>
      ))}</div>
    </article>
  );

  return (
    <div className={`app-shell ${theme}`}>
      <div className="demo-strip"><ShieldCheck size={13}/> FREE PLAY DEMO <span>·</span> Virtual credits only. No deposits, withdrawals or real-money wagers.</div>
      <header className="site-header">
        <div className="header-main">
          <button className="mobile-menu icon-button" aria-label="Menu"><Menu size={20}/></button>
          <button className="brand" onClick={()=>{setSection("sports");setActiveSport("Live Now")}}>SHARP<span>BETS</span><small>PLAY ARENA</small></button>
          <label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search teams, leagues..." aria-label="Search teams and leagues"/><kbd>⌘ K</kbd></label>
          <div className="header-actions">
            <div className="balance-chip"><Wallet size={16}/><span>{fmt(balance)}</span><small>credits</small></div>
            <button className="deposit-button" onClick={()=>setCreditsOpen(true)}><Gift size={16}/> Add demo credits</button>
            <button className="icon-button" aria-label="Toggle theme" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button>
            <div className="profile-wrap"><button className="profile-button" onClick={()=>setProfileOpen(v=>!v)}><span className="avatar">S</span><ChevronDown size={14}/></button>
              {profileOpen&&<div className="profile-menu"><b>Demo player</b><span className="muted-small">Local browser profile</span><button onClick={()=>{setResponsibleOpen(true);setProfileOpen(false)}}><ShieldCheck size={15}/> Responsible play</button><button onClick={()=>setProfileOpen(false)}><UserRound size={15}/> Close profile</button></div>}
            </div>
          </div>
        </div>
        <nav className="sport-nav">
          {sports.map(s=><button key={s} onClick={()=>{setSection("sports");setActiveSport(s)}} className={activeSport===s&&section==="sports"?"active":""}>{s==="Live Now"&&<span className="nav-live-dot"/>}{s}</button>)}
          <button className={section==="bets"?"active":""} onClick={()=>setSection("bets")}>My Bets <span className="bet-count">{bets.filter(b=>b.status==="Open").length}</span></button>
        </nav>
      </header>

      <main className="page-content">
        <div className="welcome-row"><div><div className="eyebrow">YOUR SPORTS, YOUR PACE</div><h1>{section==="bets"?"My Bets":activeSport==="Live Now"?"Live sports":"Explore "+activeSport}</h1><p>Follow the action and enjoy the game with virtual credits.</p></div><div className="safe-chip"><ShieldCheck size={16}/> Play for fun, stay in control</div></div>

        {section==="sports" ? <>
          <section className="featured-card">
            <div className="featured-copy"><span className="featured-kicker"><Zap size={13}/> FEATURED LIVE MATCH</span><h2>{featured.home}<span> vs </span>{featured.away}</h2><p>{featured.league} · {featured.clock}</p><div className="featured-score"><b>{featured.score[0]} : {featured.score[1]}</b><span className="live-label"><i/> LIVE NOW</span></div><button className="builder-button" onClick={()=>{togglePick(featured,0);setSlipOpen(true)}}>Build a bet <ChevronRight size={16}/></button></div>
            <div className="featured-stats"><div><span>Possession</span><b>58% <small>42%</small></b><div className="stat-track"><i/></div></div><div><span>Shots on target</span><b>6 <small>3</small></b><div className="stat-track"><i/></div></div><div><span>Attacks</span><b>72 <small>54</small></b><div className="stat-track"><i/></div></div></div>
          </section>
          {section==="sports"&&<div className="content-layout">
            <section className="matches-column"><div className="section-heading"><div><h2>{activeSport==="Live Now"?"Happening now":activeSport==="Upcoming"?"Coming up":activeSport+" matches"}</h2><p>{filtered.length} events · odds refresh every few seconds</p></div><button className="filter-button"><SlidersHorizontal size={15}/> Filters</button></div>
              <div className="match-list">{filtered.map(m=><MatchCard key={m.id} match={m}/>)}{!filtered.length&&<div className="empty-state">No matches found. Try another sport or search.</div>}</div>
            </section>
            <aside className="desktop-slip"><BetSlip picks={picks} matches={matches} stake={stake} setStake={setStake} balance={balance} combined={combined} potential={potential} remove={id=>setPicks(p=>p.filter(x=>x.matchId!==id))} placeBet={placeBet} playDisabled={playPaused||selfExcluded}/></aside>
          </div>}
        </> : <section className="bets-page"><div className="bets-tabs">{(["Open","Settled","Cash Out"] as const).map(t=><button key={t} className={betTab===t?"selected":""} onClick={()=>setBetTab(t)}>{t}</button>)}</div>
          {betTab==="Open"&&bets.some(b=>b.status==="Open")&&<button className="settle-button" onClick={settleDemo}>Simulate match results</button>}
          <div className="bet-history">{visibleBets.map(b=><article className="history-card" key={b.id}><div className="history-top"><b>Bet #{String(b.id).slice(-6)}</b><span className={`status-pill ${b.status.toLowerCase().replace(" ","-")}`}>{b.status}</span></div><p>{b.picks.map(p=>{const m=matches.find(x=>x.id===p.matchId);return m?m.home+" vs "+m.away:"Match";}).join(" · ")}</p><div className="history-bottom"><span>Stake <b>{fmt(b.stake)} cr</b></span><span>Potential payout <b>{fmt(b.payout)} cr</b></span><span>{b.date}</span></div>{betTab==="Cash Out"&&b.status==="Open"&&<button className="cashout-button" onClick={()=>cashOut(b)}>Cash out {fmt(b.stake*.82)} cr</button>}</article>)}{!visibleBets.length&&<div className="empty-state">Nothing here yet. Your demo bets will appear here.</div>}</div>
        </section>}
      </main>

      <footer className="site-footer"><div className="footer-main"><div><b>SHARP<span>BETS</span></b><p>A free-to-play sports interface prototype.</p></div><div className="footer-responsible"><ShieldCheck size={19}/><div><b>Play for fun, stay in control.</b><p>Set limits, take breaks and keep play enjoyable. This demo has no real-money functionality.</p><button onClick={()=>setResponsibleOpen(true)}>Responsible play settings <ChevronRight size={14}/></button></div></div></div><div className="footer-bottom">© 2026 SharpBets Demo <span>·</span> Mock fixtures and simulated odds <span>·</span> No cash value</div></footer>

      {picks.length>0&&<button className="mobile-slip-trigger" onClick={()=>setSlipOpen(true)}><span>Bet slip · {picks.length}</span><b>{fmt(potential)} cr potential</b><ChevronDown size={17}/></button>}
      {slipOpen&&<div className="sheet-backdrop" onClick={()=>setSlipOpen(false)}><div className="mobile-sheet" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><button className="sheet-close" onClick={()=>setSlipOpen(false)}><X size={18}/></button><BetSlip picks={picks} matches={matches} stake={stake} setStake={setStake} balance={balance} combined={combined} potential={potential} remove={id=>setPicks(p=>p.filter(x=>x.matchId!==id))} placeBet={placeBet}/></div></div>}
      {creditsOpen&&<Modal title="Top up your demo balance" close={()=>setCreditsOpen(false)}><p className="modal-copy">Add free virtual credits to keep exploring. This does not connect to a bank, card or payment provider.</p><div className="credit-options">{[1000,5000,10000].map(n=><button key={n} onClick={()=>{setBalance(v=>v+n);setCreditsOpen(false);setMessage(fmt(n)+" demo credits added.")}}>+{fmt(n)} credits</button>)}</div><div className="demo-note"><ShieldCheck size={15}/> Virtual credits have no cash value.</div></Modal>}
      {responsibleOpen&&<Modal title="Responsible play" close={()=>setResponsibleOpen(false)}><p className="modal-copy">Play for fun, stay in control. These local demo settings help you practise healthy limits.</p><label className="setting-row"><span>Daily virtual credit limit</span><select value={limits.daily} onChange={e=>setLimits(v=>({...v,daily:+e.target.value}))}><option value="250">250 credits</option><option value="500">500 credits</option><option value="1000">1,000 credits</option><option value="2500">2,500 credits</option></select></label><label className="setting-row"><span>Session reminder</span><select value={limits.session} onChange={e=>setLimits(v=>({...v,session:+e.target.value}))}><option value="30">Every 30 minutes</option><option value="60">Every 60 minutes</option><option value="90">Every 90 minutes</option></select></label><div className="responsible-actions"><button onClick={()=>{setPlayPaused(true);setResponsibleOpen(false);setMessage("A 24-hour cool-off has been enabled for this demo browser.");}}>Start 24-hour cool-off</button><button onClick={()=>{setSelfExcluded(true);setResponsibleOpen(false);setMessage("Self-exclusion enabled. Demo betting is now disabled in this browser.");}}>Self-exclude from this demo</button></div><div className="responsible-links"><b>Need support?</b><p>If gambling stops being fun, consider taking a break and contacting a local support service. This prototype does not provide a monitored helpline.</p><a href="https://www.gamblingtherapy.org/" target="_blank" rel="noreferrer">Gambling Therapy support <ChevronRight size={13}/></a></div><button className="primary-action" onClick={()=>setResponsibleOpen(false)}>Save demo settings</button></Modal>}
      {message&&<div className="toast"><Check size={16}/>{message}<button onClick={()=>setMessage("")}><X size={14}/></button></div>}
    </div>
  );
}

function BetSlip({picks,matches,stake,setStake,balance,combined,potential,remove,placeBet,playDisabled}:{picks:Pick[];matches:Match[];stake:string;setStake:(s:string)=>void;balance:number;combined:number;potential:number;remove:(id:number)=>void;placeBet:()=>void;playDisabled:boolean}) {
  return <div className="slip-card"><div className="slip-title"><h3>Bet slip <span>{picks.length}</span></h3><span className="virtual-tag">VIRTUAL</span></div>
    {!picks.length?<div className="slip-empty"><Trophy size={27}/><b>Your slip is empty</b><p>Choose an outcome to add it to your bet slip.</p></div>:<div className="slip-picks">{picks.map(p=>{const m=matches.find(x=>x.id===p.matchId);return <div className="slip-pick" key={p.matchId}><div><b>{m?.home} vs {m?.away}</b><small>{outcomeNames[p.outcome]} · {p.odds.toFixed(2)}</small></div><button onClick={()=>remove(p.matchId)} aria-label="Remove selection"><X size={15}/></button></div>})}</div>}
    <label className="input-label">Stake (virtual credits)</label><input className="stake-input" type="number" min="1" value={stake} onChange={e=>setStake(e.target.value)} />
    <div className="quick-stakes">{[5,10,25].map(n=><button key={n} onClick={()=>setStake(String(n))}>{n} cr</button>)}</div>
    <div className="slip-summary"><span>Combined odds</span><b>{picks.length?combined.toFixed(2):"—"}</b></div><div className="slip-summary payout"><span>Potential payout</span><b>{picks.length?fmt(potential)+" cr":"—"}</b></div><div className="balance-note">Available balance <b>{fmt(balance)} cr</b></div>
    <button className="place-button" disabled={playDisabled||!picks.length||Number(stake)<=0||Number(stake)>balance} onClick={placeBet}>Place free-play bet</button><p className="slip-disclaimer">No money is deposited, wagered or paid out.</p>
  </div>;
}

function Modal({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}) {
  return <div className="modal-backdrop" onClick={close}><section className="modal-card" onClick={e=>e.stopPropagation()}><div className="modal-head"><h3>{title}</h3><button onClick={close}><X size={18}/></button></div>{children}</section></div>;
}
