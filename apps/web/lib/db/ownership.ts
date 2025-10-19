import { prisma } from "./prisma"
export const ownership = {
  async clientHasOwner(userId: string, clientId: string) {
    const c = await prisma.client.findFirst({ where: { id: clientId, userId } })
    return !!c
  },
  async returnBelongsToClient(returnId: string, clientId: string) {
    const r = await prisma.return_.findFirst({ where: { id: returnId, clientId } })
    return !!r
  }
}
