import express, { type Request, type Response } from "express";
import type { StorageAdapter } from "../storage/types.js";
import { makeStorageKey } from "../keygen.js";
import { validateUploadInitRequest } from "../validate/validateUpload.js";
import { ok, err, type ApiError } from "../api/result.js";

function statusFor(code: ApiError["code"]): number {
  switch (code) {
    case "ValidationError": return 422;
    case "ContentTypeNotAllowed": return 415;
    case "FileTooLarge": return 413;
    case "BadRequest": return 400;
    case "StorageError":
    case "InternalError":
    default: return 500;
  }
}

export function createUploaderRouter(opts: { adapter: StorageAdapter }): import("express").Router {
  const { adapter } = opts;
  const router = express.Router();
  router.use(express.json());

  // GET /uploader/health
  router.get("/uploader/health", (_req: Request, res: Response) => {
    res.json(ok(true));
  });

  // POST /uploader/init
  router.post("/uploader/init", (req: Request, res: Response) => {
    const body = (req.body ?? {}) as unknown;
if (!validateUploadInitRequest(body)) {
  return res
    .status(statusFor("ValidationError"))
    .json(
      err(
        "ValidationError",
        "Invalid upload init request",
        { errors: (validateUploadInitRequest as any).errors }
      )
    );
}


    const { filename } = body as { filename: string };
    const key = makeStorageKey({ filename });
    const m = key.match(/^uploads\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)$/);
    const putURL = m ? `/upload/${m[1]}/${m[2]}/${m[3]}/${m[4]}` : "/upload/_/invalid";
    return res.json(ok({ key, putURL }));
  });

  // PUT /upload/:y/:m/:d/:basename  (stream body to storage)
  router.put("/upload/:y/:m/:d/:basename", async (req: Request, res: Response) => {
    try {
      const { y, m, d, basename } = req.params as Record<string, string>;
      const key = `uploads/${y}/${m}/${d}/${basename}`;
      const contentType = req.headers["content-type"];
      const sizeHeader = req.headers["content-length"];
      const size = typeof sizeHeader === "string" ? Number(sizeHeader) : undefined;

      if (!contentType || typeof contentType !== "string") {
        return res.status(statusFor("BadRequest")).json(err("BadRequest", "Missing content-type header"));
      }

      const put = await adapter.putStream(key, req, { contentType, size });

      if (!put.ok) {
        let code: ApiError["code"] = "StorageError";
        const msg = put.error || "";
        if (/unsupported content[- ]?type/i.test(msg)) code = "ContentTypeNotAllowed";
        else if (/too large|exceed/i.test(msg))       code = "FileTooLarge";
        return res.status(statusFor(code)).json(err(code, msg));
      }

      return res.json(ok(true));
    } catch (e: any) {
      return res.status(statusFor("InternalError")).json(err("InternalError", String(e?.message ?? e)));
    }
  });

  return router;
}
