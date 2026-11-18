/**
 * Rule that flags raw `console` calls in code that logs through `@ndigo/log`.
 */
import type { Context, ESTree } from '@oxlint/plugins';

import { ruleUrl } from '../_docs.js';

/** Console methods banned by default; `info`, `debug`, and `trace` stay free. */
const DEFAULT_METHODS: readonly string[] = ['log', 'warn', 'error'];

/** Options accepted by {@link noRawConsole}. */
interface NoRawConsoleOptions {
    /** Console method names to flag; an empty list falls back to the default. */
    methods?: readonly string[];
}

/**
 * Reads the configured method list, tolerating an untyped or malformed option
 * so a bad config degrades to the default rather than silencing the rule.
 *
 * @param value - The first element of `context.options`.
 * @returns The method names to flag.
 */
function readMethods(value: unknown): readonly string[] {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return DEFAULT_METHODS;
    }
    const configured = (value as NoRawConsoleOptions).methods;
    const names = Array.isArray(configured) ? configured.filter((name) => typeof name === 'string') : [];
    return names.length > 0 ? names : DEFAULT_METHODS;
}

/**
 * Reports `console.<method>(…)` calls. The rule is platform- and layout-blind:
 * where it applies is the consuming config's business, expressed as an
 * `overrides` entry rather than a path option here.
 */
export const noRawConsole = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow raw console calls in code that logs through @ndigo/log',
            url: ruleUrl('no-raw-console'),
            recommended: false,
        },
        messages: {
            rawConsole: `Raw console.{{method}} bypasses @ndigo/log — call getLogger('…') so records carry trace context. ${ruleUrl('no-raw-console')}`,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    methods: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
    } as const,
    defaultOptions: [{ methods: DEFAULT_METHODS }],
    create(context: Context) {
        const methods = new Set(readMethods(context.options[0]));

        return {
            CallExpression(node: ESTree.CallExpression) {
                const callee = node.callee;
                if (callee.type !== 'MemberExpression' || callee.computed) {
                    return;
                }
                if (callee.object.type !== 'Identifier' || callee.object.name !== 'console') {
                    return;
                }
                if (callee.property.type !== 'Identifier' || !methods.has(callee.property.name)) {
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
