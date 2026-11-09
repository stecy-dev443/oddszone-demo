"use client";
import { FormEvent,useEffect,useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
export default function ResetPassword(){
 const [token,setToken]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{setToken(new URLSearchParams(window.location.search).get("token")||"");},[]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{if(!token)throw new Error("The reset link is missing or invalid.");const r=await authClient.resetPassword({newPassword:password,token});if(r.error)throw new Error(r.error.message||"Password reset failed.");setMessage("Password updated. You can now sign in.");}catch(err){setMessage(err instanceof Error?err.message:"Password reset failed.");}finally{setBusy(false);}}
 return <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-5 py-12"><section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-7"><h1 className="mb-2 text-3xl font-black text-white">Choose a new password</h1><p className="mb-6 text-sm text-slate-400">Use at least 10 characters.</p><form onSubmit={submit} className="space-y-4"><input required minLength={10} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"/><button disabled={busy||!token} className="w-full rounded-lg bg-lime-300 p-3 font-black text-slate-950 disabled:opacity-50">{busy?"Updating…":"Update password"}</button></form>{message&&<p className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-slate-200">{message}</p>}<Link href="/login" className="mt-5 inline-block text-sm text-lime-300 underline">Return to sign in</Link></section></main>;
}
