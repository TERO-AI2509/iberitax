import { NextResponse } from "next/server"
import { apiGetAnswers,apiPostAnswers,apiUpload } from "@/lib/api"
export async function GET(req:Request){const {searchParams}=new URL(req.url);const id=searchParams.get("returnId")||"";const key=searchParams.get("key")||"";const data=await apiGetAnswers(id,key);return NextResponse.json(data)}
export async function POST(req:Request){const {searchParams}=new URL(req.url);const id=searchParams.get("returnId")||"";const key=searchParams.get("key")||"";const body=await req.json();const data=await apiPostAnswers(id,key,body);return NextResponse.json(data)}
export async function PUT(req:Request){const {searchParams}=new URL(req.url);const id=searchParams.get("returnId")||"";const area=searchParams.get("area")||"";const body=await req.json();await apiUpload(id,area,body.filename||"upload");return NextResponse.json({ok:true})}
