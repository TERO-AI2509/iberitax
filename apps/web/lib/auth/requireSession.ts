import { getServerSession } from "next-auth"
export async function requireSession() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    const err = new Error("Unauthorized")
    ;(err as any).status = 401
    throw err
  }
  return session
}
