/**
 * Rule that blocks direct imports from libraries wrapped by Ndigo integration packages.
 */
import type { Context, ESTree } from '@oxlint/plugins';

import { INTEGRATION_LAYER_MAP, INTEGRATION_LAYER_PACKAGES } from '../_constants.ts';

function getCurrentPackageName(filename: string): string | null {
    const match = /[\\/]packages[\\/]ndigo-([^\\/]+)[\\/]/u.exec(filename);

    if (!match) {
        return null;
    }

    return `@ndigo/${match[1]}`;
}

function isTestFile(filename: string): boolean {
    return (
        filename.includes('.spec.ts') ||
        filename.includes('.test.ts') ||
        filename.includes('/test/') ||
        filename.includes('\\test\\') ||
        filename.includes('/scripts/') ||
        filename.includes('\\scripts\\')
    );
}

function getIntegrationLayerLibrary(source: string): { library: string; integrationLayer: string } | null {
    for (const [library, integrationLayer] of Object.entries(INTEGRATION_LAYER_MAP)) {
        if (source === library || source.startsWith(`${library}/`)) {
            const layers = Array.isArray(integrationLayer) ? integrationLayer : [integrationLayer];
            return { library, integrationLayer: layers.join(' or ') };
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

        const reportIfMapped = (source: ESTree.StringLiteral | null): void => {
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
                data: match,
            });
        };

        return {
            ImportDeclaration(node: ESTree.ImportDeclaration) {
                reportIfMapped(node.source);
            },
            ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
                reportIfMapped(node.source);
            },
            ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
                reportIfMapped(node.source);
            },
            ImportExpression(node: ESTree.ImportExpression) {
                const { source } = node;

                // Only a literal specifier names one library; a computed import
                // cannot be classified statically and is left to the consumer's
                // bundler/runtime.
                if (source.type !== 'Literal' || typeof source.value !== 'string') {
                    return;
                }

                reportIfMapped(source);
            },
        };
    },
};
