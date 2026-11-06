/**
 * Rule that requires a canonical Ndigo documentation header at the top of
 * every source file: a top-of-file TSDoc block whose first non-empty line is a
 * one-line module summary. Tags are not required — Ndigo follows the TSDoc
 * standard, and the summary is what the module-summary TypeDoc plugin lifts
 * onto the generated module page.
 *
 * The `header` generator (`@ndigo/generators`) creates and repairs these
 * blocks:
 *
 *   `nx generate @ndigo/generators:header --file <path> --summary "..."`
 *
 * Only files under `src/` (and app client directories) are checked; test
 * files and build configuration are exempt.
 */
import type { Context } from '@oxlint/plugins';

/** Sniffs a top-of-file TSDoc block (slash-star-star … star-slash). */
function topDocBlock(source: string): string | null {
    const match = /^\s*\/\*\*[\s\S]*?\*\//u.exec(source);
    return match ? match[0] : null;
}

/** Whether the file is one the convention applies to (source only). */
function isCheckedFile(filename: string): boolean {
    return /(^|[\\/])(src|client)([\\/]|$)/u.test(filename) && filename.endsWith('.ts');
}

export const requiresDocHeader = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require a canonical Ndigo doc header (top-of-file TSDoc block) on source files',
        },
        messages: {
            missingHeader:
                'Source file is missing the canonical doc header. Run \'nx generate @ndigo/generators:header --file {{file}} --summary "…"\'.',
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        return {
            Program() {
                const filename = context.filename ?? context.getFilename?.() ?? '';
                if (!isCheckedFile(filename) || !context.sourceCode.text) {
                    return;
                }

                const block = topDocBlock(context.sourceCode.text);
                if (block === null) {
                    context.report({
                        node: context.sourceCode.ast,
                        messageId: 'missingHeader',
                        data: { file: filename },
                    });
                }
            },
        };
    },
};
