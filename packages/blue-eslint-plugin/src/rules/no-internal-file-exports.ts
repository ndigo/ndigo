/**
 * Rule that prevents public index files from re-exporting internal underscore-prefixed files.
 *
 * Migrated from ESLint to oxlint JS Plugin API.
 * Uses createOnce + before hook pattern for dual compatibility and future performance.
 */

import type { Context, ESTree } from '@oxlint/plugins';

function isPublicIndexFile(filename: string): boolean {
    return /[\\/]src[\\/]index\.ts$/u.test(filename);
}

/**
 * Reports public barrel exports that expose internal implementation files.
 */
export const noInternalFileExports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow exporting internal underscore-prefixed files from public API entry points',
        },
        messages: {
            internalExport: "Exporting internal file '{{source}}' in public API (index.ts) is not allowed.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const filename = context.filename ?? context.getFilename?.() ?? '';

        // Only run on public index files
        if (!isPublicIndexFile(filename)) {
            return {};
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
                // Only flag exports of internal underscore-prefixed relative files (e.g. './_foo').
                if (!node.source.value.startsWith('./_')) {
                    return;
                }

                context.report({
                    node: node.source,
                    messageId: 'internalExport',
                    data: {
                        source: node.source.value,
                    },
                });
            },
        };
    },
};