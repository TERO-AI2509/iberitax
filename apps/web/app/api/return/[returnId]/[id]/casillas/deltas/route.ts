import { NextResponse } from "next/server"
import { apiGetCasillaDeltas } from "@/lib/api"
export async function GET(_:Request,{params}:{params:{id:string}}){const data=await apiGetCasillaDeltas(params.returnId);return NextResponse.json({items:data})}
