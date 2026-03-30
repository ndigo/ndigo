/** @author opencode */

import { ESLintUtils } from '@typescript-eslint/utils';

import { INTEGRATION_LAYER_MAP, INTEGRATION_LAYER_PACKAGES } from '../_constants.js';

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/user/blue/blob/main/packages/blue-eslint-plugin/docs/${name}.md`
);

function getCurrentPackageName(filename: string): string | null {
    const match = /[\\/]packages[\\/]blue-([^\\/]+)[\\/]/u.exec(filename);

    if (!match) {
        return null;
    }

    return `@blue/${match[1]}`;
}

function isTestFile(filename: string): boolean {
    return (
        filename.includes('.spec.ts') ||
        filename.includes('.test.ts') ||
        filename.includes('/test/') ||
        filename.includes('\\test\\')
    );
}

function getIntegrationLayerLibrary(source: string): { library: string; integrationLayer: string } | null {
    for (const [library, integrationLayer] of Object.entries(INTEGRATION_LAYER_MAP)) {
        if (source === library || source.startsWith(`${library}/`)) {
            return { library, integrationLayer };
        }
    }

    return null;
}

export const noDirectIntegrationImports = createRule({
    name: 'no-direct-integration-imports',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow direct imports from libraries encapsulated by integration layer packages',
        },
        messages: {
            directImport: "Import from '{{library}}' is not allowed. Use '{{integrationLayer}}' instead.",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename;
        const currentPackageName = getCurrentPackageName(filename);

        const isInsideIntegrationLayerPackage =
            currentPackageName !== null && INTEGRATION_LAYER_PACKAGES.includes(currentPackageName);

        if (isInsideIntegrationLayerPackage || isTestFile(filename)) {
            return {};
        }

        return {
            ImportDeclaration(node) {
                const sourceValue = node.source.value;

                if (typeof sourceValue !== 'string') {
                    return;
                }

                const match = getIntegrationLayerLibrary(sourceValue);

                if (!match) {
                    return;
                }

                context.report({
                    node: node.source,
                    messageId: 'directImport',
                    data: {
                        library: match.library,
                        integrationLayer: match.integrationLayer,
                    },
                });
            },
            ExportNamedDeclaration(node) {
                const sourceValue = node.source?.value;

                if (typeof sourceValue !== 'string') {
                    return;
                }

                const match = getIntegrationLayerLibrary(sourceValue);

                if (!match) {
                    return;
                }

                context.report({
                    node: node.source,
                    messageId: 'directImport',
                    data: {
                        library: match.library,
                        integrationLayer: match.integrationLayer,
                    },
                });
            },
        };
    },
});
