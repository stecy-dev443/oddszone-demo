import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db";
import { authSchema, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
export function getAuth() {
 const db=getDb();
 return betterAuth({
  appName:"SharpBets",
  baseURL:process.env.BETTER_AUTH_URL||(process.env.VERCEL_URL?"https://"+process.env.VERCEL_URL:process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"),
  secret:process.env.BETTER_AUTH_SECRET,
  database:drizzleAdapter(db,{provider:"pg",schema:authSchema}),
  emailAndPassword:{
   enabled:true,requireEmailVerification:false,minPasswordLength:10,maxPasswordLength:128,revokeSessionsOnPasswordReset:true,
   sendResetPassword:async({user:account,url})=>{
    if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)throw new Error("Password reset email is not configured. Contact the site administrator.");
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({
     from:process.env.EMAIL_FROM,to:[account.email],subject:"Reset your SharpBets password",
     html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033"><h1>Reset your password</h1><p>We received a request to reset your SharpBets password.</p><p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#c5f36b;color:#172033;text-decoration:none;font-weight:bold;border-radius:8px">Reset password</a></p><p>If you did not request this, you can ignore this email.</p></div>`
    })});
    if(!response.ok)throw new Error("Password reset email could not be sent.");
   }
  },
  user:{additionalFields:{role:{type:"string",required:false,defaultValue:"user",input:false}}},
  databaseHooks:{user:{create:{after:async(created)=>{
   if(process.env.ADMIN_EMAIL&&created.email.toLowerCase()===process.env.ADMIN_EMAIL.toLowerCase())
    await db.update(user).set({role:"admin"}).where(eq(user.id,created.id));
  }}}}
 });
}
