"use client";
import { FormEvent,useState } from "react";
import { authClient } from "@/lib/auth-client";
export default function LoginPage(){
 const [mode,setMode]=useState<"signin"|"signup">("signin"),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{
  const healthResponse=await fetch("/api/health",{cache:"no-store"});const health=healthResponse.ok?await healthResponse.json():null;
  if(!health?.capabilities?.authentication)throw new Error("Account access is temporarily unavailable while the SharpBets database is being connected. Please try again after setup is complete.");
  const result=mode==="signup"?await authClient.signUp.email({name:name.trim(),email:email.trim(),password}):await authClient.signIn.email({email:email.trim(),password});
  if(result.error)throw new Error(result.error.message||"Authentication failed.");window.location.href="/";
 }catch(err){setMessage(err instanceof Error?err.message:"Unable to sign in.");}finally{setBusy(false);}}
 return <main className="auth-shell mx-auto flex min-h-[82vh] max-w-lg items-center px-5 py-12"><section className="auth-card w-full rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-2xl">
 <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-lime-300">SharpBets account</p><h1 className="mb-2 text-3xl font-black text-white">{mode==="signup"?"Create your account":"Welcome back"}</h1>
 <p className="mb-7 text-sm text-slate-400">Secure account access. Your balance is virtual and has no cash value.</p>
 <form onSubmit={submit} className="space-y-4">{mode==="signup"&&<label className="block text-sm text-slate-300">Display name<input required minLength={2} maxLength={60} value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"/></label>}
 <label className="block text-sm text-slate-300">Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"/></label>
 <label className="block text-sm text-slate-300">Password<input required minLength={10} type="password" autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"/></label>
 {message&&<p role="alert" className="rounded-lg bg-rose-950 p-3 text-sm text-rose-200">{message}</p>}
 <button disabled={busy} className="w-full rounded-lg bg-lime-300 px-4 py-3 font-black text-slate-950 disabled:opacity-50">{busy?"Please wait…":mode==="signup"?"Create account":"Sign in"}</button></form>
 <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button onClick={()=>{setMode(mode==="signup"?"signin":"signup");setMessage("");}} className="text-sm text-slate-300 underline">{mode==="signup"?"Already registered? Sign in":"New to SharpBets? Create an account"}</button>{mode==="signin"&&<a href="/forgot-password" className="text-sm text-lime-300 underline">Forgot password?</a>}</div>
 </section></main>;
}
