import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [, , cmd, email, password, role = "user"] = process.argv;
if (!cmd || !email || !password) {
  process.stdout.write("usage: node tools/dev-add-user.mjs add <email> <password> [role]\n");
  process.exit(1);
}
const file = path.resolve("apps/web/dev-users.json");
const dir = path.dirname(file);
fs.mkdirSync(dir, { recursive: true });
let users = [];
if (fs.existsSync(file)) {
  users = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(users)) users = [];
}
if (cmd === "add") {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    exists.salt = salt;
    exists.hash = hash;
    exists.role = role;
  } else {
    users.push({ email, salt, hash, role });
  }
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
  process.stdout.write(`ok: ${email}\n`);
  process.exit(0);
}
process.stdout.write("unknown command\n");
process.exit(1);
