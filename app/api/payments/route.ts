import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({enabled:false,message:"Deposits, withdrawals and payment processing are intentionally disabled."},{status:410});}
export async function POST(){return NextResponse.json({enabled:false,error:"Payments are disabled. SharpBets uses virtual credits only."},{status:410});}
