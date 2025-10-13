import { registerAuthDevRoutes } from "./routes/auth-dev.mjs";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerRecentUploadsRoute } from "./routes/recent-uploads.mjs";
import { registerManageFilesRoutes } from "./routes/manage-files.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

const STATIC_ROOT = path.resolve(__dirname, "../uploads");
app.use("/files", express.static(STATIC_ROOT));
app.use("/dl", express.static(STATIC_ROOT));

registerRecentUploadsRoute(app);
registerManageFilesRoutes(app);
registerAuthDevRoutes(app);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  process.stdout.write(`stub listening on ${port}\n`);
});
