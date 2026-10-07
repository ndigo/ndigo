/**
 * A Vite plugin that lowers TC39 decorators to ES2022 with esbuild.
 *
 * Vite 8 transforms modules with Oxc, whose transformer passes decorator
 * syntax through (verified against oxc-transform 0.151: no option shape —
 * `decorator.legacy`, `target`, `typescript.experimentalDecorators` — lowers
 * it), and its chunk-level `vite:esbuild-transpile` stage did not engage for
 * the app `build.lib` outputs (verified with a bundle syntax check,
 * 2026-10-06). Browsers cannot parse `@decorator` syntax, so decorator-using
 * client bundles (e.g. `@service`/`@getCall`, `@signal`/`@effect`) shipped as
 * invalid JavaScript while Vitest suites stayed green (Vitest transforms
 * through esbuild). This plugin runs before the default transforms and uses
 * esbuild — which lowers decorators for any target below `esnext` — for
 * TypeScript modules in the workspace. App configs apply it for `build` only;
 * test transforms are handled by Vitest's own esbuild pipeline.
 *
 * @module scripts/vite-plugin-lower-decorators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { transform } from 'esbuild';

/** TypeScript module extensions (`.ts`, `.mts`, `.cts`, `.tsx`). */
const tsModuleRe = /\.(m?ts|tsx)$/;

/** Workspace package sources resolved through pnpm symlinks (`packages/blue-*`). */
const workspacePackageRe = /[\\/]packages[\\/]blue-[^\\/]+[\\/]/;

/**
 * Creates the decorator-lowering plugin.
 *
 * @returns A Vite plugin object (`enforce: 'pre'`) that rewrites decorators.
 */
export function lowerDecorators() {
    return {
        name: 'blue:lower-decorators',
        enforce: 'pre',
        /**
         * @param code - The module source.
         * @param id - The module id (may carry a query suffix).
         * @returns The transformed module, or `null` when not applicable.
         */
        async transform(code, id) {
            const file = id.split('?')[0];
            if (!tsModuleRe.test(file)) {
                return null;
            }
            // Bundled third-party dependencies are already browser-ready; only
            // the workspace's own package sources (symlinked through
            // `node_modules`) need the transform alongside app code.
            if (file.includes('node_modules') && !workspacePackageRe.test(file)) {
                return null;
            }
            const result = await transform(code, {
                loader: file.endsWith('.tsx') ? 'tsx' : 'ts',
                target: 'ES2022',
                sourcemap: true,
            });
            return { code: result.code, map: result.map ?? null };
        },
    };
}
