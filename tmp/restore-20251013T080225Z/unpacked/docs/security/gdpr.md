# GDPR — Local Export & Delete (MVP)

Scope: local developer environment for Iberitax MVP.  
Principles: data minimization, dry-run first, explicit apply on writes.

## Export (Right of Access)
- Query by identifier (e.g., email, NIF/NIE, IBAN fragment).
- Scan allowed directories: artifacts/, report/, uploads/, history/, notify/, plus top-level *mapped.* and *ocr.* files.
- Produce:
  - Manifest JSON of matched files + hit counts
  - Snapshot ZIP with matched originals
  - Optional redacted preview for safe sharing

## Delete (Right to Erasure)
- Dry-run lists candidate files + counts.
- Apply mode (`APPLY=1`) moves files into `report/quarantine/<timestamp>/` and leaves a tombstone note in place.
- Deletion log JSON saved under `report/quarantine/<timestamp>/delete.log.json`.

## Commands
- Export: `node scripts/security.userdata.export.mjs "<query>" [--redact]`
- Delete (dry-run): `node scripts/security.userdata.delete.mjs "<query>"`
- Delete (apply): `APPLY=1 node scripts/security.userdata.delete.mjs "<query>"`

## Notes
- Patterns are literal substring matches; include full identifiers where possible for precision.
- Redaction uses rules from `docs/security/redaction.rules.json`.
- CI does not run delete/export.
