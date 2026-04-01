/**
 * ESLint rule that prevents public index files from re-exporting internal underscore-prefixed files.
 */

import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/user/blue/blob/main/packages/blue-eslint-plugin/docs/${name}.md`
);

function isPublicIndexFile(filename: string): boolean {
    return /[\\/]src[\\/]index\.ts$/u.test(filename);
}

function isInternalRelativeSource(source: TSESTree.Literal | null | undefined): source is TSESTree.Literal {
    return !!source && typeof source.value === 'string' && source.value.startsWith('./_');
}

/**
 * Reports public barrel exports that expose internal implementation files.
 */
export const noInternalFileExports = createRule({
    name: 'no-internal-file-exports',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow exporting internal underscore-prefixed files from public API entry points',
        },
        messages: {
            internalExport: "Exporting internal file '{{source}}' in public API (index.ts) is not allowed.",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        if (!isPublicIndexFile(context.filename)) {
            return {};
        }

        return {
            ExportAllDeclaration(node) {
                if (!isInternalRelativeSource(node.source)) {
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
});
