/**
 * Rule that prevents cross-package imports of underscore-prefixed internal files.
 *
 * Migrated from ESLint to oxlint JS Plugin API.
 * Uses createOnce + before hook pattern for dual compatibility and future performance.
 */

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
    createOnce(context: any) {
        function checkSource(sourceNode: any): void {
            if (!sourceNode || typeof sourceNode.value !== 'string') {
                return;
            }

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
            ImportDeclaration(node: any) {
                checkSource(node.source);
            },
            ExportNamedDeclaration(node: any) {
                checkSource(node.source);
            },
        };
    },
};
