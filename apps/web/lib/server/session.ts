import { cookies } from 'next/headers';
export type SessionCheck = { ok: boolean; status: 200|401; session: null };
export async function requireSession(): Promise<SessionCheck> {
  try {
    const jar = cookies();
    const ibx = jar.get('ibx_session')?.value ?? '';
    const ok =
      jar.has('__Secure-next-auth.session-token') ||
      jar.has('next-auth.session-token') ||
      (ibx && ibx.length >= 16 && ibx !== 'invalid');
    return ok ? { ok:true, status:200, session:null } : { ok:false, status:401, session:null };
  } catch {
    return { ok:false, status:401, session:null };
  }
}
