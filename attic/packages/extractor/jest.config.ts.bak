import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },
  // Map ESM-style .js specifiers in tests to the TS sources under src/
  moduleNameMapper: {
    "^\\.\\./src/(.+)\\.js$": "<rootDir>/src/$1.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "cjs", "json", "node"],
  testMatch: ["**/tests/**/*.test.ts"],
};

export default config;
