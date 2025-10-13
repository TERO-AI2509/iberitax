/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true, tsconfig: "<rootDir>/tsconfig.jest.json" }] },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleFileExtensions: ["ts","tsx","mts","js","mjs","cjs","json"],
  // Allow TS sources to import "./foo.js" (runtime-correct) but resolve to TS during tests
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^(\\.{1,2}/.*)\\.mjs$": "$1"
  },
  transformIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: ["/dist/", "/build/"]
};
