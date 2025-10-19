"use client"
import { useParams } from "next/navigation"
import OverviewTiles from "@/components/flow/OverviewTiles"

export default function Page(){
  const p = useParams() as any
  const clientId = p.clientId as string
  const returnId = p.returnId as string
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <OverviewTiles clientId={clientId} returnId={returnId}/>
    </div>
  )
}
