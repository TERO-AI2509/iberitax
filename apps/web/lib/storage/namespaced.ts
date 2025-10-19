export function nsKey(clientId: string, returnId: string, key: string) {
  return `client:${clientId}:return:${returnId}:${key}`
}
