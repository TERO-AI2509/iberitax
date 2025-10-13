import { mkdirSync, openSync, closeSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd().replace(/\/$/, '');
const DIR  = join(ROOT, 'artifacts', 'modelo100', 'locks');
const pathFor = (case_id) => join(DIR, `${case_id}.lock`);

export function acquireCaseLock(case_id){
  try{
    mkdirSync(DIR, { recursive: true });
    const fd = openSync(pathFor(case_id), 'wx');
    closeSync(fd);
    return true;
  }catch{
    return false;
  }
}

export function releaseCaseLock(case_id){
  try{
    const p = pathFor(case_id);
    if(existsSync(p)) unlinkSync(p);
  }catch{}
}
