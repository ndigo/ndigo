/**
 * Rule that blocks direct imports from libraries wrapped by BlueJS integration packages.
 *
 * Migrated from ESLint to oxlint JS Plugin API.
 * Uses createOnce + before hook pattern for dual compatibility and future performance.
 */

import type { Context, ESTree } from '@oxlint/plugins';

import { INTEGRATION_LAYER_MAP, INTEGRATION_LAYER_PACKAGES } from '../_constants.js';

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

/**
 * Reports imports that should come from an integration layer package instead of a direct dependency.
 */
export const noDirectIntegrationImports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow direct imports from libraries encapsulated by integration layer packages',
        },
        messages: {
            directImport: "Import from '{{library}}' is not allowed. Use '{{integrationLayer}}' instead.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const filename = context.filename ?? context.getFilename?.() ?? '';
        const currentPackageName = getCurrentPackageName(filename);

        const isInsideIntegrationLayerPackage =
            currentPackageName !== null && INTEGRATION_LAYER_PACKAGES.includes(currentPackageName);

        if (isInsideIntegrationLayerPackage || isTestFile(filename)) {
            return {};
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ImportDeclaration(node: ESTree.ImportDeclaration) {
                const match = getIntegrationLayerLibrary(node.source.value);

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
            ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
                const source = node.source;

                if (source === null) {
                    return;
                }

                const match = getIntegrationLayerLibrary(source.value);

                if (!match) {
                    return;
                }

                context.report({
                    node: source,
                    messageId: 'directImport',
                    data: {
                        library: match.library,
                        integrationLayer: match.integrationLayer,
                    },
                });
            },
        };
    },
};
