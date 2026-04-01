/**
 * ESLint rule that prevents cross-package imports of underscore-prefixed internal files.
 */

import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/user/blue/blob/main/packages/blue-eslint-plugin/docs/${name}.md`
);

const CROSS_PACKAGE_INTERNAL_IMPORT_PATTERN = /^@blue\/[^/]+\/_/u;

/**
 * Reports imports that bypass a package's public API by reaching into internal files.
 */
export const noInternalFileImports = createRule({
    name: 'no-internal-file-imports',
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
    },
    defaultOptions: [],
    create(context) {
        function checkSource(sourceNode: TSESTree.Literal | null | undefined): void {
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
            ImportDeclaration(node) {
                checkSource(node.source);
            },
            ExportNamedDeclaration(node) {
                checkSource(node.source);
            },
        };
    },
});
