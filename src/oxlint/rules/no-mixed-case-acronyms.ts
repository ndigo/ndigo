/**
 * Rule that flags mixed-case acronyms (Http, Json, Xml, Url, Api, Html, Dto,
 * Uuid, Uri, and others) in type declaration names.
 *
 * Acronyms are split into PascalCase segments (digit-aware) so that a
 * mixed-case acronym is detected as a whole word, not as a substring of an
 * ordinary identifier (`Uint8Array` is fine; `MCPToolRegistry` is not).
 */
import type { Context, ESTree } from '@oxlint/plugins';

const ACRONYMS: ReadonlySet<string> = new Set([
    'HTTP',
    'JSON',
    'XML',
    'URL',
    'API',
    'HTML',
    'DTO',
    'UUID',
    'URI',
    'CSV',
    'EJS',
    'TOON',
    'MCP',
    'JWT',
    'OIDC',
    'SSE',
    'STOMP',
    'SDK',
    'A2UI',
    'UI',
    'DB',
    'SQL',
    'TTL',
    'CSP',
    'LRU',
    'LFU',
    'CSS',
    'SVG',
    'YAML',
    'CORS',
    'TLS',
    'RPC',
    'ORM',
    'WS',
    'TSV',
    'IP',
]);

/** Split a PascalCase identifier into its constituent words. */
function splitSegments(name: string): string[] {
    return name
        .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1 $2')
        .split(/\s+/u)
        .filter(Boolean);
}

/** Returns the offending mixed-case acronym, or `null` when the name is clean. */
function findMixedCaseAcronym(name: string): string | null {
    for (const segment of splitSegments(name)) {
        const upper = segment.toUpperCase();
        if (ACRONYMS.has(upper) && segment !== upper) {
            return segment;
        }
    }
    return null;
}

type TypeLikeDeclaration =
    | ESTree.Class
    | ESTree.TSInterfaceDeclaration
    | ESTree.TSTypeAliasDeclaration
    | ESTree.TSEnumDeclaration;

/**
 * Reports type declaration names containing mixed-case acronyms.
 */
export const noMixedCaseAcronyms = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow mixed-case acronyms in type declaration names',
        },
        messages: {
            mixedCaseAcronym:
                "Type name '{{name}}' contains a mixed-case acronym ({{acronym}}); use all-uppercase in types (HTTPTransformer) or all-lowercase in identifiers (httpTransformer) per STYLE_GUIDE §3.9.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkName(node: TypeLikeDeclaration): void {
            const id = node.id;
            if (id === null) {
                return;
            }
            const name = id.name;
            const acronym = findMixedCaseAcronym(name);
            if (acronym !== null) {
                context.report({
                    node: id,
                    messageId: 'mixedCaseAcronym',
                    data: {
                        name,
                        acronym,
                    },
                });
            }
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ClassDeclaration(node: ESTree.Class) {
                checkName(node);
            },
            TSInterfaceDeclaration(node: ESTree.TSInterfaceDeclaration) {
                checkName(node);
            },
            TSTypeAliasDeclaration(node: ESTree.TSTypeAliasDeclaration) {
                checkName(node);
            },
            TSEnumDeclaration(node: ESTree.TSEnumDeclaration) {
                checkName(node);
            },
        };
    },
};
