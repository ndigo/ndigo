/**
 * Rule that flags raw `console.warn`/`console.error`/`console.log` calls in
 * package source, steering framework logging through `@blue/log`.
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/** The console methods whose raw use in framework source is banned. */
const RAW_CONSOLE_METHODS: Record<string, true> = { warn: true, error: true, log: true };

/**
 * Packages allowed to touch the console directly: `@blue/log` is the console
 * bridge itself, and `@blue/util` is the documented leaf exception (it cannot
 * depend on the logger without inverting the dependency direction).
 */
const ALLOWED_PACKAGES: Record<string, true> = { '@blue/log': true, '@blue/util': true };

/** Matches the source tree of any `packages/blue-<name>` package. */
const packageSource = /[\\/]packages[\\/]blue-[^\\/]+[\\/]src[\\/]/u;

/** True for spec/test files, which legitimately spy on the console. */
function isTestFile(filename: string): boolean {
    return (
        filename.includes('.spec.ts') ||
        filename.includes('.test.ts') ||
        filename.includes('/test/') ||
        filename.includes('\\test\\')
    );
}

/** Extracts the `@blue/<name>` package name from a package path. */
function packageOf(filename: string): string | null {
    const match = /[\\/]packages[\\/]blue-([^\\/]+)[\\/]/u.exec(filename);
    return match ? `@blue/${match[1]}` : null;
}

/**
 * Reports raw `console.warn`/`console.error`/`console.log` call sites in
 * package source.
 *
 * The framework logs through `@blue/log` so every record follows the
 * configured logger (console bridge or OpenTelemetry) and carries trace
 * context. Raw console calls bypass that pipeline, so they are banned in
 * `packages/blue-<name>/src` — except in `@blue/log` (the bridge itself) and
 * `@blue/util` (the documented leaf exception). Specs and test files are out
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
                "Raw `console.{{method}}` is not allowed in package source — log through `@blue/log` (`getLogger('…')`) instead. Only `@blue/log` (the console bridge) and `@blue/util` (documented leaf exception) may touch the console directly.",
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
