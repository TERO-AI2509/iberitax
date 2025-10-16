# @iberitax/web — Upload Init Demo

This demo adds **/upload** which calls `@iberitax/uploader` client to hit the stub-server’s `/uploader/init` and shows the returned `key` and `putURL`.

## Run

1) Start stub server:
   ```bash
   pnpm -C apps/stub-server start
   ```

   Health:
   ```bash
   curl -s http://127.0.0.1:4000/uploader/health
   # => {"ok":true,"data":true}
   ```

2) Start web:
   ```bash
   pnpm -C apps/web dev
   ```

Open http://localhost:3000/upload and submit a filename + contentType to see `key` and `putURL`.
