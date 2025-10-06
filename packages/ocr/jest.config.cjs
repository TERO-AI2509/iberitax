const base = require("../../jest.base-esm.cjs")

module.exports = {
  ...base,
  extensionsToTreatAsEsm: [".ts"],
  transform: {},
  testEnvironment: "node",
  testMatch: ["**/tests/contracts/**/*.test.(mjs|js)"],
}
