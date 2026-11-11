/**
 * Storybook configuration for the Ndigo UI registry components.
 */
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/web-components-vite';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const REGISTRY_BASE = `${ROOT}/packages/ndigo-ui/registry/base`;

const storybookConfig: StorybookConfig = {
    stories: ['../src/stories/**/*.stories.@(ts|tsx|mdx)'],
    addons: ['@storybook/addon-a11y'],
    framework: {
        name: '@storybook/web-components-vite',
        options: {},
    },
    viteFinal: async (viteConfig) => {
        viteConfig.resolve ??= {};
        const existing = viteConfig.resolve.alias;
        const alias = Array.isArray(existing) ? [...existing] : [];
        alias.push({ find: /^@\/lib\//u, replacement: `${REGISTRY_BASE}/` });
        viteConfig.resolve.alias = alias;
        return viteConfig;
    },
};

export default storybookConfig;
