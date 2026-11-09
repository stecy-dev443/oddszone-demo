"use client";
import { FormEvent,useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
export default function ForgotPassword(){
 const [email,setEmail]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await authClient.requestPasswordReset({email:email.trim(),redirectTo:window.location.origin+"/reset-password"});if(r.error)throw new Error(r.error.message||"Unable to send reset email.");setMessage("If the account exists and email delivery is configured, a reset link will arrive shortly.");}catch(err){setMessage(err instanceof Error?err.message:"Unable to request reset.");}finally{setBusy(false);}}
 return <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-5 py-12"><section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-7"><Link href="/login" className="text-sm text-lime-300">← Back to sign in</Link><h1 className="mb-2 mt-5 text-3xl font-black text-white">Reset your password</h1><p className="mb-6 text-sm text-slate-400">Enter your account email and we’ll send a secure reset link.</p><form onSubmit={submit} className="space-y-4"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"/><button disabled={busy} className="w-full rounded-lg bg-lime-300 p-3 font-black text-slate-950 disabled:opacity-50">{busy?"Sending…":"Send reset link"}</button></form>{message&&<p className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-slate-200">{message}</p>}</section></main>;
}
