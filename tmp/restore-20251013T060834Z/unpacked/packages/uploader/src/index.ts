export const ping = () => "pong";

// keep public re-exports (with .js extensions for NodeNext build)
export * from "./validate/validateUpload.js";
export * from "./keygen.js";
export * from "./storage/types.js";
export * from "./storage/localfs.js";
export * from "./server/router.js";

// export only the function from client to avoid type name clashes
export { createUploaderClient, putFile } from "./client.js";

// canonical API result types live here
export * from "./api/result.js";

