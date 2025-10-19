import { NextResponse } from "next/server"
import { apiApplySuggestion } from "@/lib/api"
export async function POST(req:Request,{params}:{params:{id:string}}){const payload=await req.json();const data=await apiApplySuggestion(params.returnId,payload);return NextResponse.json(data)}
