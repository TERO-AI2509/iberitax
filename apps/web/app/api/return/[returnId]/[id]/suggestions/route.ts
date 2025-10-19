import { NextResponse } from "next/server"
import { apiGetSuggestions } from "@/lib/api"
export async function GET(req:Request,{params}:{params:{id:string}}){const {searchParams}=new URL(req.url);const section=searchParams.get("section")||"summary";const data=await apiGetSuggestions(params.returnId,section);return NextResponse.json({items:data})}
