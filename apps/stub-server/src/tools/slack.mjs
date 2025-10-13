export async function slackNotify(url, payload){
  try{
    if(!url) return {ok:false,skipped:true};
    const res = await fetch(url, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)});
    return {ok: res.ok};
  }catch(e){ return {ok:false,error:String(e)} }
}
