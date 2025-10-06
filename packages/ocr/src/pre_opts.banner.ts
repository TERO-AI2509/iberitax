import { getPreprocessOptsFromEnv } from "./index.js";
const opts = getPreprocessOptsFromEnv();
console.log("PRE_OPTS", JSON.stringify(opts));
