import http from "node:http";
import express from "express";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { LocalFSAdapter } from "../../src/storage/localfs";
import { createUploaderRouter } from "../../src/server/router";
import { createUploaderClient } from "../../src/client";

function listenOnEphemeral(app: express.Express): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") return reject(new Error("no address"));
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function tmpRootPath() {
  return fs.mkdtemp(path.join(os.tmpdir(), "iberitax-uploader-client-"));
}

test("createUploaderClient.initUpload + PUT upload saves the file", async () => {
  const root = await tmpRootPath();
  const adapter = new LocalFSAdapter({ rootDir: root });

  const app = express();
  app.use(createUploaderRouter({ adapter }));
  const { server, url } = await listenOnEphemeral(app);

  try {
    const client = createUploaderClient({ baseURL: url });
    const init = await client.initUpload({ filename: "demo.pdf", contentType: "application/pdf", size: 11 });
    expect(init.ok).toBe(true);

    if (!init.ok) throw new Error("initUpload failed");
    const { key, putURL } = init.data;

    // PUT bytes to the server using node fetch
    const data = Buffer.from("hello world");
    const putRes = await fetch(url + putURL, {
      method: "PUT",
      headers: { "content-type": "application/pdf", "content-length": String(data.length) },
      body: data
    });
    expect(putRes.ok).toBe(true);

    // Verify file saved
    const saved = await fs.readFile(adapter.resolveKeyPath(key), "utf8");
    expect(saved).toBe("hello world");
  } finally {
    server.close();
  }
});
