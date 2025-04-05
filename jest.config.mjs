import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// List known ESM modules from node_modules that need transformation
const esmModules = [
  'react-markdown',
  'vfile',
  'unist-.+',
  'unified',
  'bail',
  'is-plain-obj',
  'trough',
  'remark-.+',
  'rehype-.+',
  'mdast-.+',
  'micromark',
  'micromark-.+',
  'parse-entities',
  'character-entities',
  'character-reference-invalid',
  'is-decimal',
  'is-hexadecimal',
  'is-alphanumerical',
  'decode-named-character-reference',
  'ccount',
  'github-markdown-css',
  // Add any other ESM modules your specific project uses here
].join('|');

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // Simplified transformIgnorePatterns targeting specific ESM modules
  transformIgnorePatterns: [
    `/node_modules/(?!(${esmModules}|.*\\.mjs$))/`,
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': `<rootDir>/__mocks__/fileMock.js`,

    // Handle module aliases (this should cover all @/ imports)
    '^@/(.*)$': '<rootDir>/$1',
  },
  preset: 'ts-jest',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
