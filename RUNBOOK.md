
## 2025-09-27 — Error-handling approach & lessons (Ajv strictRequired)
**Context:** During Phase 01-02 we hit Ajv `strictRequired` failures for the `UploadInitResponse` schema when using `if/then` (and later `oneOf` with shared top-level `properties`).  
**Diagnosis:** Ajv in strict mode expects each branch to be **self-contained**: required fields in a branch must be declared within that same branch.  
**Fix:** Replace shared top-level `properties` with fully independent `oneOf` branches—each branch declares its own `type`, `properties`, and `required`. This eliminated the `strictRequired` error while keeping strict mode on.

**Process we followed (to be reused):**
1. **Reproduce quickly** with minimal test scope (run the specific failing jest tests).
2. **Read the exact compiler/runtime error** and identify the rule (here: Ajv `strictRequired`).
3. **Smallest-delta fix first**: we tried `if/then` → then `oneOf` with shared props → finally **self-contained `oneOf` branches** (the working pattern).
4. **Generalize and codify**: record the “self-contained branches” rule for all union-like response envelopes.
5. **Lock with tests**: golden fixtures and contract tests for both pass/fail cases.

**Tooling note:** The local terminal does **not** support `applypatch`.  
**Policy:** Use heredoc overwrites (`cat > file <<'EOF'`) or tiny `node/sed` edits in single paste-and-run scripts.

## 2025-09-27 — Lesson: Avoid ESM-only deps in tests unless Jest is configured
- Issue: Jest failed on `uuid@13` (ESM-only) in node_modules.
- Fix: Use Node stdlib `crypto.randomUUID()` instead of `uuid`.
- Rule: Prefer stdlib over new deps; if a dep is ESM-only, either enable Jest ESM transforms or avoid it.

## 2025-09-27 — 01-07: Clean API + Errors
- Standardized envelope: success={ok:true,data}, error={ok:false,code,error,details?}.
- HTTP status mapping: ValidationError=422, ContentTypeNotAllowed=415, FileTooLarge=413, BadRequest=400, Storage/Internal=500.
- Schemas use self-contained oneOf branches.
- Tests added for invalid init + disallowed content-type.
- Docs added in packages/uploader/README.md.

## Tooling constraints (global, all steps)
- Do NOT use `applypatch` anywhere. It is forbidden in instructions and scripts.
- Only use POSIX-safe edits:
  1) Full-file replace with:  cat > path <<'EOF' ... EOF
  2) Small in-place changes with: sed -i '' on macOS (or sed -i on Linux).

