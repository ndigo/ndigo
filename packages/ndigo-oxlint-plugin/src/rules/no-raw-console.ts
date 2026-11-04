/**
 * Rule that flags raw `console.warn`/`console.error`/`console.log` calls in
 * package source, steering framework logging through `@ndigo/log`.
 * @module ndigo-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/** The console methods whose raw use in framework source is banned. */
const RAW_CONSOLE_METHODS: Record<string, true> = { warn: true, error: true, log: true };

/**
 * Packages allowed to touch the console directly: `@ndigo/log` is the console
 * bridge itself, and `@ndigo/util` is the documented leaf exception (it cannot
 * depend on the logger without inverting the dependency direction).
 */
const ALLOWED_PACKAGES: Record<string, true> = { '@ndigo/log': true, '@ndigo/util': true };

/** Matches the source tree of any `packages/ndigo-<name>` package. */
const packageSource = /[\\/]packages[\\/]ndigo-[^\\/]+[\\/]src[\\/]/u;

/** True for spec/test files, which legitimately spy on the console. */
function isTestFile(filename: string): boolean {
    return (
        filename.includes('.spec.ts') ||
        filename.includes('.test.ts') ||
        filename.includes('/test/') ||
        filename.includes('\\test\\')
    );
}

/** Extracts the `@ndigo/<name>` package name from a package path. */
function packageOf(filename: string): string | null {
    const match = /[\\/]packages[\\/]ndigo-([^\\/]+)[\\/]/u.exec(filename);
    return match ? `@ndigo/${match[1]}` : null;
}

/**
 * Reports raw `console.warn`/`console.error`/`console.log` call sites in
 * package source.
 *
 * The framework logs through `@ndigo/log` so every record follows the
 * configured logger (console bridge or OpenTelemetry) and carries trace
 * context. Raw console calls bypass that pipeline, so they are banned in
 * `packages/ndigo-<name>/src` — except in `@ndigo/log` (the bridge itself) and
 * `@ndigo/util` (the documented leaf exception). Specs and test files are out
 * of scope (they legitimately spy on the console).
 */
export const noRawConsole = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow raw console.warn/console.error/console.log calls in package source',
        },
        messages: {
            rawConsole:
                "Raw `console.{{method}}` is not allowed in package source — log through `@ndigo/log` (`getLogger('…')`) instead. Only `@ndigo/log` (the console bridge) and `@ndigo/util` (documented leaf exception) may touch the console directly.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const filename = context.filename ?? context.getFilename?.() ?? '';
        if (!packageSource.test(filename) || isTestFile(filename)) {
            return {};
        }
        const packageName = packageOf(filename);
        if (packageName !== null && ALLOWED_PACKAGES[packageName] === true) {
            return {};
        }

        return {
            CallExpression(node: ESTree.CallExpression) {
                const callee = node.callee;
                if (callee.type !== 'MemberExpression' || callee.computed) {
                    return;
                }
                if (callee.object.type !== 'Identifier' || callee.object.name !== 'console') {
                    return;
                }
                if (callee.property.type !== 'Identifier' || RAW_CONSOLE_METHODS[callee.property.name] !== true) {
                    return;
                }
                context.report({
                    node: callee.property,
                    messageId: 'rawConsole',
                    data: { method: callee.property.name },
                });
            },
        };
    },
};
