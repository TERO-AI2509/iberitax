import fs from "fs";
function parseDate(d) {
  if (!d) return null;
  const x = new Date(d);
  if (isNaN(x)) return null;
  return x;
}
function dateInRange(target, from, to) {
  if (!target) return true;
  const tf = from ? new Date(from) : null;
  const tt = to ? new Date(to) : null;
  if (tf && target < tf) return false;
  if (tt && target > tt) return false;
  return true;
}
function jsonPathGet(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function opTest(left, op, right) {
  if (op === "==") return left === right;
  if (op === "!=") return left !== right;
  if (op === "in") return Array.isArray(right) && right.includes(left);
  if (op === "contains") return Array.isArray(left) && left.includes(right);
  if (op === "gt") return left > right;
  if (op === "gte") return left >= right;
  if (op === "lt") return left < right;
  if (op === "lte") return left <= right;
  if (op === "between") return Array.isArray(right) && right.length === 2 && left >= right[0] && left <= right[1];
  if (op === "regex") return typeof right === "string" && new RegExp(right).test(String(left));
  if (op === "exists") return right ? left !== undefined && left !== null : left === undefined || left === null;
  return false;
}
function conditionsMatch(conditions, context) {
  if (!conditions || conditions.length === 0) return true;
  for (const c of conditions) {
    const left = jsonPathGet(context, c.path);
    if (!opTest(left, c.op, c.value)) return false;
  }
  return true;
}
function authorityRankOf(a) {
  if (typeof a === "number") return a;
  const map = {
    constitution: 100,
    statute: 90,
    code: 90,
    regulation: 80,
    decree: 80,
    ordinance: 75,
    ruling: 70,
    case_law: 65,
    administrative: 60,
    guidance: 55,
    circular: 50,
    letter_ruling: 45,
    private_letter: 40,
    newsletter: 10
  };
  if (!a) return 0;
  const key = String(a).toLowerCase();
  return map[key] ?? 0;
}
function clarityScoreOf(r) {
  if (typeof r.clarity_score === "number") return r.clarity_score;
  if (typeof r.clarity === "number") return r.clarity;
  const t = typeof r.text === "string" ? r.text : "";
  return Math.min(100, Math.floor(t.length / 100));
}
function recencyOf(r) {
  const c = parseDate(r.last_updated) || parseDate(r.version_date) || parseDate(r.effective_from);
  return c ? c.getTime() : 0;
}
function eventDateFromContext(context) {
  return parseDate(context.tax_event_date) || parseDate(context.period_end) || parseDate(context.assessment_date) || null;
}
function temporalMatch(rule, ctxDate) {
  const ef = parseDate(rule.effective_from);
  const et = parseDate(rule.effective_to);
  const rr = parseDate(rule.retroactive_to);
  if (!ctxDate) return true;
  if (dateInRange(ctxDate, ef, et)) return true;
  if (rr && ctxDate >= rr && ef && ctxDate < ef) return true;
  return false;
}
function enrichRule(rule) {
  const aRank = typeof rule.authority_rank === "number" ? rule.authority_rank : authorityRankOf(rule.authority);
  const cScore = clarityScoreOf(rule);
  const rScore = recencyOf(rule);
  return { ...rule, _authority_rank: aRank, _clarity_score: cScore, _recency_score: rScore };
}
function reasonForSelection(top, other) {
  const reasons = [];
  if (top._authority_rank !== other._authority_rank) reasons.push("higher_authority");
  if (top._clarity_score !== other._clarity_score) reasons.push("greater_clarity");
  if (top._recency_score !== other._recency_score) reasons.push("more_recent");
  return reasons;
}
export function applyRules(input) {
  const now = input.now ? parseDate(input.now) : new Date();
  const context = input.context || {};
  const rules = Array.isArray(input.rules) ? input.rules : [];
  const ctxDate = eventDateFromContext(context) || now;
  const ignored_rules = [];
  const candidates = [];
  for (const r of rules) {
    const temporal = temporalMatch(r, ctxDate);
    const conds = conditionsMatch(r.conditions, context);
    if (!temporal || !conds) {
      ignored_rules.push({
        rule: r,
        reason: !temporal ? "temporal_mismatch" : "condition_mismatch"
      });
      continue;
    }
    candidates.push(enrichRule(r));
  }
  candidates.sort((a, b) => {
    if (b._authority_rank !== a._authority_rank) return b._authority_rank - a._authority_rank;
    if (b._clarity_score !== a._clarity_score) return b._clarity_score - a._clarity_score;
    if (b._recency_score !== a._recency_score) return b._recency_score - a._recency_score;
    const as = typeof a.score === "number" ? a.score : 0;
    const bs = typeof b.score === "number" ? b.score : 0;
    if (bs !== as) return bs - as;
    const aid = String(a.id || "");
    const bid = String(b.id || "");
    return aid.localeCompare(bid);
  });
  const applied_rules = [];
  const conflicts = [];
  if (candidates.length > 0) {
    const top = candidates[0];
    applied_rules.push({
      rule: top,
      selection_basis: {
        authority_rank: top._authority_rank,
        clarity_score: top._clarity_score,
        recency_score: top._recency_score
      },
      provenance: top.provenance || null
    });
    for (let i = 1; i < candidates.length; i++) {
      const c = candidates[i];
      conflicts.push({
        rule: c,
        status: "Interesting reading",
        reasons: reasonForSelection(top, c),
        provenance: c.provenance || null
      });
    }
  }
  const application_result = {
    input_context: context,
    applied_rules,
    ignored_rules,
    conflicts,
    resolved_at: new Date().toISOString()
  };
  return application_result;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const buf = fs.readFileSync(0, "utf8");
  const payload = buf ? JSON.parse(buf) : {};
  const out = applyRules(payload);
  process.stdout.write(JSON.stringify(out, null, 2));
}
