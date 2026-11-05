/**
 * A Vite plugin that lowers TC39 decorators to ES2022 with esbuild.
 *
 * Vite 8 transforms modules with Oxc, whose transformer passes decorator
 * syntax through (re-verified 2026-10-07 against oxc-transform 0.153: no
 * option shape lowers standard decorators, and `decorator.legacy` emits the
 * pre-TC39 calling convention — decorators receive no TC39 context, so
 * `context.kind`/`context.metadata` users throw at runtime), and its
 * chunk-level `vite:esbuild-transpile` stage did not engage for the app
 * `build.lib` outputs (verified with a bundle syntax check, 2026-10-06).
 * Browsers cannot parse `@decorator` syntax, so decorator-using
 * client bundles (e.g. `@service`/`@getCall`, `@signal`/`@effect`) shipped as
 * invalid JavaScript while Vitest suites stayed green (Vitest 4 transformed
 * through esbuild, which lowered them). This plugin runs before the default
 * transforms and uses esbuild — which lowers decorators for any target below
 * `esnext` — for TypeScript modules in the workspace. Every app with browser
 * sources applies it for BOTH `vite build` and `vite dev` (the demo apps
 * forward it unconditionally; `ndigo-todo`'s former `command === 'build'` gate
 * is gone), so neither path ships raw decorators. Every Vitest lane carries it
 * too: Vitest 5 transforms through the same Vite 8 Oxc pipeline, which passes
 * decorators through unchanged, while the lanes resolve workspace sources to
 * `src/` through the shared `vitest.aliases.ts` table.
 *
 * Scope (SEC-B/WC-I):
 *
 * - Only **TypeScript module sources** are rewritten: `.ts`, `.mts`, `.cts`
 *   and `.tsx`. Built `lib/*.js` inputs (a dependency's compiled output, or a
 *   workspace package resolved through its `exports` → `lib/`) are **out of
 *   scope** — they are expected to be browser-ready, and `tsc` already lowers
 *   standard decorators into helper calls when building the package.
 * - A module is only handed to esbuild when it actually contains a decorator.
 *   The cheap `/^\s*@|[{(;]\s*@/m` pre-check returns decorator-free modules
 *   unchanged, so the plugin does not re-transform every workspace `.ts` (the
 *   transform, and its sourcemap, is dropped for the common case). It is a
 *   heuristic, not a parse: it covers a decorator at the start of a line (the
 *   formatted form) and one starting a class/member body or a parameter list
 *   (`{ @dec`, `(@inject`), which is every syntactically valid position in
 *   practice. A module with no `@` in such a position is left alone.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { transform } from 'esbuild';

/** TypeScript module extensions (`.ts`, `.mts`, `.cts`, `.tsx`). */
const tsModuleRe = /\.(?:[cm]?ts|tsx)$/;

/** Cheap pre-check: a decorator starting a line, or opening a member body / parameter list. */
const decoratorRe = /^\s*@|[{(;]\s*@/m;

/** Workspace package sources resolved through pnpm symlinks (`packages/ndigo-*`). */
const workspacePackageRe = /[\\/]packages[\\/]ndigo-[^\\/]+[\\/]/;

/**
 * Creates the decorator-lowering plugin.
 *
 * @returns A Vite plugin object (`enforce: 'pre'`) that rewrites decorators.
 */
export function lowerDecorators() {
    return {
        name: 'ndigo:lower-decorators',
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
            // Nothing to lower: return the source untouched so esbuild (and its
            // sourcemap) is skipped for decorator-free modules.
            if (!decoratorRe.test(code)) {
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
