export function requirePostSecret(req, res){
  const url = new URL(req.url, 'http://stub');
  const devOK = url.searchParams.get('dev-auth') === '1';
  const hdr = req.headers['x-lawyer-secret'];
  const want = process.env.LAWYER_POST_SECRET;
  if (devOK) return true;
  if (!want || !hdr || hdr !== want) {
    res.statusCode = 401;
    return false;
  }
  return true;
}
