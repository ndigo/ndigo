/**
 * Rule that prevents cross-package imports of underscore-prefixed internal files.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

const crossPackageInternalImportPattern = /^@ndigo\/[^/]+\/_/u;

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
            if (!crossPackageInternalImportPattern.test(sourceNode.value)) {
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
            ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
                checkSource(node.source);
            },
        };
    },
};
