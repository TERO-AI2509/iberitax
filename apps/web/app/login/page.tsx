export const dynamic = "force-dynamic"
export const revalidate = 0

export default function LoginPage(){
  return (
    <main id="main" className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form action="/api/auth/signin" method="post" className="space-y-3 max-w-sm">
        <label className="block">
          <span className="block mb-1">Email</span>
          <input name="email" type="email" required className="w-full px-3 py-2 rounded-md border" />
        </label>
        <button className="px-3 py-2 rounded-md border">Continue</button>
      </form>
    </main>
  )
}
