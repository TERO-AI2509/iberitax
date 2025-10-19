export function parentOf(path:string){
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "/flow";
  return `/${parts.slice(0, parts.length-1).join("/")}`;
}
const ITEM_SEQS: Record<string,string[]> = {
  "/flow/deductions/housing/owner": [
    "/flow/deductions/housing/owner",
    "/flow/deductions/housing/owner/details"
  ],
  "/flow/deductions/housing/tenant": [
    "/flow/deductions/housing/tenant",
    "/flow/deductions/housing/tenant/details"
  ]
};
export function nextInItem(path:string){
  const key = Object.keys(ITEM_SEQS).find(k => path===k || path.startsWith(k+"/"));
  if (!key) return "";
  const seq = ITEM_SEQS[key];
  const i = seq.indexOf(path);
  if (i>=0 && i<seq.length-1) return seq[i+1];
  return "";
}
export function prevInItem(path:string){
  const key = Object.keys(ITEM_SEQS).find(k => path===k || path.startsWith(k+"/"));
  if (!key) return "";
  const seq = ITEM_SEQS[key];
  const i = seq.indexOf(path);
  if (i>0) return seq[i-1];
  return "";
}
