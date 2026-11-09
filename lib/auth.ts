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
  emailAndPassword:{enabled:true,requireEmailVerification:false,minPasswordLength:10,maxPasswordLength:128,revokeSessionsOnPasswordReset:true},
  user:{additionalFields:{role:{type:"string",required:false,defaultValue:"user",input:false}}},
  databaseHooks:{user:{create:{after:async(created)=>{
   if(process.env.ADMIN_EMAIL&&created.email.toLowerCase()===process.env.ADMIN_EMAIL.toLowerCase())
    await db.update(user).set({role:"admin"}).where(eq(user.id,created.id));
  }}}}
 });
}
