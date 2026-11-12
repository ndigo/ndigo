/**
 * Storybook configuration for the Ndigo UI registry components.
 */
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/web-components-vite';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const REGISTRY = `${ROOT}/packages/ndigo-ui/registry`;

const storybookConfig: StorybookConfig = {
    stories: ['../src/stories/**/*.stories.@(ts|tsx|mdx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/web-components-vite',
        options: {},
    },
    options: {
        // Foundations first, then the catalogue. Within a component `Default`
        // leads, so the first story is always the canonical example.
        storySort: (alpha, beta) => {
            const groups = ['Foundations', 'UI', 'Blocks'];
            const [groupAlpha] = alpha.title.split('/');
            const [groupBeta] = beta.title.split('/');
            const groupDelta = groups.indexOf(groupAlpha) - groups.indexOf(groupBeta);
            if (groupDelta !== 0 && groups.includes(groupAlpha) && groups.includes(groupBeta)) return groupDelta;
            if (alpha.title !== beta.title) return alpha.title.localeCompare(beta.title);
            if (alpha.name === 'Default') return -1;
            if (beta.name === 'Default') return 1;
            return alpha.name.localeCompare(beta.name);
        },
    },
    viteFinal: async (viteConfig) => {
        viteConfig.resolve ??= {};
        const existing = viteConfig.resolve.alias;
        const alias = Array.isArray(existing) ? [...existing] : [];
        // The registry's own base classes import through `@/lib/*`; stories
        // import the blocks' `init*` controllers through `@registry/*`.
        alias.push({ find: /^@\/lib\//u, replacement: `${REGISTRY}/base/` });
        alias.push({ find: /^@registry\//u, replacement: `${REGISTRY}/` });
        viteConfig.resolve.alias = alias;
        return viteConfig;
    },
};

export default storybookConfig;
