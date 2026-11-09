import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
let pool: Pool | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
 const url=process.env.DATABASE_URL;
 if(!url) throw new Error("DATABASE_URL is missing. Connect Neon Postgres in Vercel.");
 if(!pool) pool=new Pool({connectionString:url,max:5});
 if(!db) db=drizzle(pool,{schema});
 return db;
}
