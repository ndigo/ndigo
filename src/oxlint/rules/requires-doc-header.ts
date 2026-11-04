/**
 * Rule that requires the canonical Ndigo documentation header at the top of
 * every source file.
 *
 * Per STYLE_GUIDE §5 (Documentation Blocks): every file begins with a single
 * TSDoc block carrying `@module`, `@since`, and `@author` tags, before any
 * imports. The `header` generator (`@ndigo/generators`) creates and repairs
 * these blocks:
 *
 *   `nx generate @ndigo/generators:header --file <path>`
 *
 * Only files under `src/` and `test/` (and app client directories) are
 * checked; build configuration and generated files are exempt.
 */

import type { Context } from '@oxlint/plugins';

/** Tags the canonical header must carry. */
const REQUIRED_TAGS = ['@module', '@since', '@author'] as const;

/**
 * A stray `*` before a tag line (` * * @module …`) — a copy-paste artifact
 * that renders as a literal asterisk in generated module docs. Tag-presence
 * checks alone accept it, so it spread across the tree once (115 files).
 */
const malformedTagLinePattern = /^[ \t]*\*[ \t]+\*[ \t]+@/mu;

/** Sniffs a top-of-file TSDoc block (slash-star-star … star-slash). */
function topDocBlock(source: string): string | null {
    const match = /^\s*\/\*\*[\s\S]*?\*\//u.exec(source);
    return match ? match[0] : null;
}

/** Whether the file is one the convention applies to (source or tests). */
function isCheckedFile(filename: string): boolean {
    return /(^|[\\/])(src|test|client)([\\/]|$)/u.test(filename) && filename.endsWith('.ts');
}

/**
 * Reports missing or incomplete documentation headers.
 */
export const requiresDocHeader = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require the canonical Ndigo doc header (@module/@since/@author) on source files',
        },
        messages: {
            missingHeader:
                "Source file is missing the canonical doc header. Run 'nx generate @ndigo/generators:header --file {{file}}'.",
            missingTags:
                "Doc header is missing the {{tags}} tag(s); run 'nx generate @ndigo/generators:header --file {{file}} --force'.",
            malformedTagLine:
                "Doc header has a stray '*' before a tag line (reads '* * @…'); repair with 'nx generate @ndigo/generators:header --file {{file}} --force'.",
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
                    return;
                }

                if (malformedTagLinePattern.test(block)) {
                    context.report({
                        node: context.sourceCode.ast,
                        messageId: 'malformedTagLine',
                        data: { file: filename },
                    });
                    return;
                }

                const missing = REQUIRED_TAGS.filter((tag) => !block.includes(tag));
                if (missing.length > 0) {
                    context.report({
                        node: context.sourceCode.ast,
                        messageId: 'missingTags',
                        data: { tags: missing.join(', '), file: filename },
                    });
                }
            },
        };
    },
};
