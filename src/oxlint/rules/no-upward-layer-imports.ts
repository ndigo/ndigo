/**
 * Rule that forbids imports pointing upward through the package layer ranks.
 *
 * A package's runtime source files (`src/**`) may import another `@ndigo/*`
 * package only when the target's {@link LAYER_RANK} is at or below its own —
 * the ranks encode the runtime dependency direction derived in `_layers.ts`.
 * Tests and benches may reach across layers (their edges come from
 * `devDependencies`, which the ranks deliberately exclude), tooling packages
 * (exempt by {@link TOOLING_PACKAGES}) sit outside the layer system, and
 * non-package code (apps, root scripts) is never reported.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

import { LAYER_RANK, TOOLING_PACKAGES } from '../_layers.ts';

/** Captures the package slug from a runtime source file: `packages/ndigo-<slug>/src/…`. */
const packageSourcePattern = /(?:^|[\\/])packages[\\/]ndigo-([^\\/]+)[\\/]src[\\/]/u;

/** Captures the root package slug from an `@ndigo/<slug>[/subpath]` specifier. */
const ndigoSpecifierPattern = /^@ndigo\/([^/]+)(?:\/|$)/u;

/**
 * Reports imports of packages whose layer rank exceeds the importer's rank.
 */
export const noUpwardLayerImports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow imports of packages ranked above the importing package',
        },
        messages: {
            upwardImport:
                "'{{source}}' is layer rank {{targetRank}} but '{{importer}}' is rank {{importerRank}} — a package may import only packages at its own rank or below (see src/oxlint/README.md).",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        let importer: string | null = null;

        function checkSource(sourceNode: ESTree.Expression, typeOnly: boolean = false): void {
            // Type-only imports/exports erase at runtime and do not create a
            // runtime dependency edge, so they are exempt from the layer ranks.
            if (typeOnly) {
                return;
            }
            if (importer === null || sourceNode.type !== 'Literal') {
                return;
            }
            // Every literal member exposes `value`; only string specifiers matter.
            const specifier: unknown = (sourceNode as { value?: unknown }).value;
            if (typeof specifier !== 'string') {
                return;
            }
            const match = ndigoSpecifierPattern.exec(specifier);
            if (match === null) {
                return;
            }
            const target = match[1];
            if (target === importer || TOOLING_PACKAGES.has(target)) {
                return;
            }
            const importerRank = LAYER_RANK[importer];
            const targetRank = LAYER_RANK[target];
            // Unknown slugs (a new package before the map catches up, or a
            // removed package still referenced by prose) are the sync spec's
            // concern, not this rule's.
            if (importerRank === undefined || targetRank === undefined || targetRank <= importerRank) {
                return;
            }
            context.report({
                node: sourceNode,
                messageId: 'upwardImport',
                data: { source: specifier, importer, importerRank, targetRank },
            });
        }

        return {
            Program() {
                const filename = context.filename ?? context.getFilename?.() ?? '';
                const match = packageSourcePattern.exec(filename);
                if (match === null) {
                    return;
                }
                importer = TOOLING_PACKAGES.has(match[1]) ? null : match[1];
            },
            ImportDeclaration(node: ESTree.ImportDeclaration) {
                checkSource(node.source, node.importKind === 'type');
            },
            ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
                if (node.source !== null) {
                    checkSource(node.source, node.exportKind === 'type');
                }
            },
            ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
                checkSource(node.source, node.exportKind === 'type');
            },
            ImportExpression(node: ESTree.ImportExpression) {
                checkSource(node.source, false);
            },
        };
    },
};
