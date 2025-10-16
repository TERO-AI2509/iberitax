import express from "express";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const router = express.Router();

const DATA_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../uploads");
const USERS_FILE = path.join(DATA_ROOT, "dev-users.json");
const TOKENS_FILE = path.join(DATA_ROOT, "dev-auth-tokens.json");

async function ensureFiles() {
  await fs.mkdir(DATA_ROOT, { recursive: true });
  try { await fs.access(USERS_FILE); } catch { await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2)); }
  try { await fs.access(TOKENS_FILE); } catch { await fs.writeFile(TOKENS_FILE, JSON.stringify({ tokens: [] }, null, 2)); }
}

async function readJSON(file) {
  const txt = await fs.readFile(file, "utf8");
  return JSON.parse(txt || "{}");
}

async function writeJSON(file, obj) {
  await fs.writeFile(file, JSON.stringify(obj, null, 2));
}

router.post("/dev-auth/request-link", express.json(), async (req, res) => {
  await ensureFiles();
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return res.status(400).json({ ok: false, error: "invalid_email" });

  const users = await readJSON(USERS_FILE);
  let user = users.users.find(u => u.email === email);
  if (!user) {
    user = { id: crypto.randomUUID(), email };
    users.users.push(user);
    await writeJSON(USERS_FILE, users);
  }

  const tokObj = await readJSON(TOKENS_FILE);
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 15 * 60 * 1000;
  tokObj.tokens = tokObj.tokens.filter(t => t.expiresAt > Date.now());
  tokObj.tokens.push({ token, email, userId: user.id, expiresAt, used: false });
  await writeJSON(TOKENS_FILE, tokObj);

  const magicLink = `/api/auth/callback/dev-magic?token=${token}`;
  process.stdout.write(`Magic link for ${email}: ${magicLink}\n`);
  res.json({ ok: true, magicLink, email });
});

router.get("/dev-auth/verify", async (req, res) => {
  await ensureFiles();
  const token = String(req.query.token || "");
  const tokObj = await readJSON(TOKENS_FILE);
  const match = tokObj.tokens.find(t => t.token === token && t.expiresAt > Date.now() && !t.used);
  if (!match) return res.status(400).json({ ok: false, valid: false });
  res.json({ ok: true, valid: true, email: match.email, userId: match.userId });
});

router.post("/dev-auth/consume", express.json(), async (req, res) => {
  await ensureFiles();
  const token = String(req.body?.token || "");
  const tokObj = await readJSON(TOKENS_FILE);
  const found = tokObj.tokens.find(t => t.token === token && t.expiresAt > Date.now() && !t.used);
  if (!found) return res.status(400).json({ ok: false, error: "invalid_or_expired" });
  found.used = true;
  await writeJSON(TOKENS_FILE, tokObj);
  res.json({ ok: true, email: found.email, userId: found.userId });
});

export function registerAuthDevRoutes(app) {
  app.use("/", router);
}
