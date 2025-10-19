import { requireSession } from "../auth/requireSession"
import { cookies, headers } from "next/headers"
type DB = {
  clientHasOwner(userId: string, clientId: string): Promise<boolean>
  returnBelongsToClient(returnId: string, clientId: string): Promise<boolean>
}
export async function enforceOwnership(db: DB, clientId?: string, returnId?: string) {
  const session = await requireSession()
  if (!clientId) return notFound()
  const ownsClient = await db.clientHasOwner(session.user.id, clientId)
  if (!ownsClient) return notFound()
  if (returnId) {
    const ok = await db.returnBelongsToClient(returnId, clientId)
    if (!ok) return notFound()
  }
  return { userId: session.user.id, clientId, returnId }
}
export function notFound(): never {
  const err: any = new Error("Not Found")
  err.status = 404
  throw err
}
