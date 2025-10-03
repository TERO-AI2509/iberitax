/** Minimal Jest config for TS in Next.js without Babel */
module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig.json' }] },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  testMatch: ['<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx)']
};
