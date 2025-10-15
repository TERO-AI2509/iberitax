# @iberitax/uploader — API envelopes

Success: { ok: true, data: <T> }
Error: { ok: false, code, error, details? }
Codes: BadRequest, ValidationError, ContentTypeNotAllowed, FileTooLarge, StorageError, InternalError
Status: 400, 422, 415, 413, 500

Endpoints:
- GET /uploader/health
- POST /uploader/init -> { ok:true, data:{ key, putURL } } | { ok:false, ... }
- PUT /upload/:y/:m/:d/:basename -> streams body; enforces content-type & length
