import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";
async function handle(request:Request){
 const h=toNextJsHandler(getAuth());
 return request.method==="GET"?h.GET(request):h.POST(request);
}
export const GET=handle;
export const POST=handle;
