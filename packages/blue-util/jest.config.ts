import type { JestConfigWithTsJest } from 'ts-jest';
import { default as rootConfig } from '../../jest.config';

const config: JestConfigWithTsJest = {
    ...rootConfig,

    rootDir: '.',
    displayName: 'util',
};

export default config;
