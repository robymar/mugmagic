import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Module paths
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // Test match patterns
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.tsx',
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'lib/**/*.{ts,tsx}',
        'app/api/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
    ],

    // Coverage thresholds
    coverageThresholds: {
        global: {
            statements: 70,
            branches: 60,
            functions: 70,
            lines: 70,
        },
    },

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
    ],

    // Transform
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },

    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;
