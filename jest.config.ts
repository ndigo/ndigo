
import type { JestConfigWithTsJest } from 'ts-jest';
/*
const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: [ '.ts' ],
  globals: {
    'ts-jest': {
        tsconfig: 'tsconfig.build.json'
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  preset: 'ts-jest/presets/default-esm',
  projects: [ '<rootDir>', '<rootDir>/packages/*' ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
*/

const config: JestConfigWithTsJest = {
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.tsx?$': [ 'ts-jest', {
            useESM: true,
            tsconfig: 'tsconfig.build.json'
        } ],
    },
  };

export default config;
