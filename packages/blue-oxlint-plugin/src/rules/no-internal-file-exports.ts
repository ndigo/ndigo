/**
 * Rule that prevents public index files from re-exporting internal underscore-prefixed files.
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

function isPublicIndexFile(filename: string): boolean {
    // Match the package barrel (`src/index.ts`) and any sub-barrel at any depth
    // under `src/` (e.g. `src/metrics/index.ts`, `src/a/b/index.ts`). An earlier
    // `/[\\/]src[\\/](?:[^\\/]+[\\/])?index\.ts$/` matched the top-level barrel
    // plus one nested level only, so a two-level-nested barrel escaped the gate
    // (RES-D / RES-AD46-DEPTH).
    return /[\\/]src(?:[\\/][^\\/]+)*[\\/]index\.ts$/u.test(filename);
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

        function checkSource(sourceNode: ESTree.StringLiteral): void {
            // Only flag exports of internal underscore-prefixed relative files (e.g. './_foo').
            if (!sourceNode.value.startsWith('./_')) {
                return;
            }

            context.report({
                node: sourceNode,
                messageId: 'internalExport',
                data: {
                    source: sourceNode.value,
                },
            });
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
                checkSource(node.source);
            },
            ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
                if (node.source !== null) {
                    checkSource(node.source);
                }
            },
        };
    },
};
