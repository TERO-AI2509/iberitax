require("whatwg-fetch");
require("@testing-library/jest-dom");

const originalError = console.error;
console.error = (...args) => {
  const msg = (args[0] || "").toString();
  if (msg.includes("not wrapped in act(")) return;
  originalError(...args);
};

if (globalThis.Response && typeof globalThis.Response.json !== "function") {
  globalThis.Response.json = (data, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return new globalThis.Response(JSON.stringify(data), { ...init, headers });
  };
}
