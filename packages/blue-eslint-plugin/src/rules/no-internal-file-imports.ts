/**
 * Rule that prevents cross-package imports of underscore-prefixed internal files.
 *
 * Migrated from ESLint to oxlint JS Plugin API.
 * Uses createOnce + before hook pattern for dual compatibility and future performance.
 */

import type { Context, ESTree } from '@oxlint/plugins';

const CROSS_PACKAGE_INTERNAL_IMPORT_PATTERN = /^@blue\/[^/]+\/_/u;

/**
 * Reports imports that bypass a package's public API by reaching into internal files.
 */
export const noInternalFileImports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow importing internal underscore-prefixed files from other packages',
        },
        messages: {
            internalImport:
                "Importing internal file '{{source}}' across package boundaries is not allowed. Use the public API instead.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    createOnce(context: Context) {
        function checkSource(sourceNode: ESTree.StringLiteral): void {
            if (!CROSS_PACKAGE_INTERNAL_IMPORT_PATTERN.test(sourceNode.value)) {
                return;
            }

            context.report({
                node: sourceNode,
                messageId: 'internalImport',
                data: {
                    source: sourceNode.value,
                },
            });
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ImportDeclaration(node: ESTree.ImportDeclaration) {
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