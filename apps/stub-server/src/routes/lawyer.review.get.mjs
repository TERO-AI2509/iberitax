import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

export default async function handler(req, res){
  if (req.method !== 'GET') { res.statusCode=405; return res.end(); }
  const p = path.resolve('artifacts/review/lawyer_review.log.jsonl');
  try{
    if (!fs.existsSync(p)) {
      await fsp.mkdir(path.dirname(p), {recursive:true});
      await fsp.writeFile(p, '', 'utf8');
    }
    res.setHeader('content-type','application/x-ndjson; charset=utf-8');
    fs.createReadStream(p).on('error', () => {
      res.statusCode = 204; res.end();
    }).pipe(res);
  }catch(e){
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ok:false,error:String(e)}));
  }
}
