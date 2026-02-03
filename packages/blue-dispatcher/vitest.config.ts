import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        esbuild: {
            target: 'es2022',
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: false,
                    emitDecoratorMetadata: false,
                    useDefineForClassFields: true,
                },
            },
        },
    })
);
