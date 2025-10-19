export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { mapCasillaToKeys, mapKeyToCasillas, loadMapping } from "@/lib/mapping"

export async function GET(req:Request){
  try{
    const {searchParams}=new URL(req.url)
    const casilla=searchParams.get("casilla")
    const key=searchParams.get("key")
    if(casilla!==null){
      const n=Number(casilla)
      if(!Number.isFinite(n)) return NextResponse.json({error:"invalid casilla"}, {status:400})
      return NextResponse.json({keys:mapCasillaToKeys(n)})
    }
    if(key!==null){
      return NextResponse.json({casillas:mapKeyToCasillas(key)})
    }
    return NextResponse.json(loadMapping())
  }catch(e:any){
    return NextResponse.json({error:String(e?.message||e)}, {status:500})
  }
}
