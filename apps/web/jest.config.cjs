module.exports = {
  rootDir: ".",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  testMatch: [
    "<rootDir>/**/__tests__/**/*.test.ts",
    "<rootDir>/**/__tests__/**/*.test.tsx",
    "<rootDir>/**/__tests__/**/*.spec.ts",
    "<rootDir>/**/__tests__/**/*.spec.tsx"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest"
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg|png|jpg)$": "<rootDir>/__mocks__/fileMock.js",
    "^server-only$": "<rootDir>/__mocks__/server-only.js",
    "^next/navigation$": "<rootDir>/__mocks__/next-navigation.js"
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"]
};
