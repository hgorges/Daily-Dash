import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [`<rootDir>/src/**/*.ts`],
    testMatch: [`<rootDir>/test/**/*test.ts`],
    setupFiles: [`<rootDir>/test/config.ts`],
};

export default config;
