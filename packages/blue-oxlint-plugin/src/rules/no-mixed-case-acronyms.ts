/**
 * Rule that flags mixed-case acronyms (Http, Json, Xml, Url, Api, Html, Dto,.
 * * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

const titleCaseAcronyms = /(Http|Json|Xml|Url|Api|Html|Dto|Uuid|Uri)/u;

type TypeLikeDeclaration = ESTree.Class | ESTree.TSInterfaceDeclaration | ESTree.TSTypeAliasDeclaration;

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
            const match = titleCaseAcronyms.exec(name);
            if (match !== null) {
                context.report({
                    node: id,
                    messageId: 'mixedCaseAcronym',
                    data: {
                        name,
                        acronym: match[1],
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
        };
    },
};
