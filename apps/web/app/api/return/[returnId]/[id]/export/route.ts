import { NextResponse } from "next/server"
import { apiGetCasillaDeltas } from "@/lib/api"
import { mapKeyToCasillas } from "@/lib/mapping"

// Simple export: deltas + mapping-based casillas per section prefix
export async function GET(_:Request,{params}:{params:{id:string}}){
  const id=params.id
  const deltas=await apiGetCasillaDeltas(id)
  const sections=["income.salary","housing.mortgage","income.rental","income.capital.interests","income.capital.dividends","deductions.regional.rent.young"]
  const mapping:any={}
  for(const s of sections){ mapping[s]=mapKeyToCasillas(s) }
  return NextResponse.json({ casillaDeltas: deltas, mapping })
}
