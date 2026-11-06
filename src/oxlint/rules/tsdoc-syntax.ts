/**
 * Rule that validates TSDoc syntax in doc comments (slash-star-star … star-slash) using
 * `@microsoft/tsdoc`. Port of `eslint-plugin-tsdoc`'s `tsdoc/syntax` rule:
 * every parser diagnostic (unknown tag, malformed inline tag, unescaped
 * brace, JSDoc-style `@param {type}`, etc.) becomes a lint diagnostic.
 *
 * House tags: none. Ndigo follows the TSDoc standard; custom tags are not
 * registered. The rule therefore reports `@since`/`@author` (and any other
 * legacy tag) as `tsdoc-undefined-tag` until the source is cleaned up.
 */
import type { Context } from '@oxlint/plugins';
import { TSDocParser, TSDocConfiguration } from '@microsoft/tsdoc';

const parser = new TSDocParser(new TSDocConfiguration());

export const tsdocSyntax = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Validate TSDoc syntax in doc comments',
        },
        messages: {
            tsdocSyntax: '[{{messageId}}] {{message}}',
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        return {
            Program() {
                const comments = context.sourceCode.getAllComments();
                for (const comment of comments) {
                    if (comment.type !== 'Block' || !comment.value.startsWith('*')) {
                        continue;
                    }
                    const text = `/*${comment.value}*/`;
                    let parsed;
                    try {
                        parsed = parser.parseString(text);
                    } catch {
                        continue;
                    }
                    for (const msg of parsed.log.messages) {
                        const start = context.sourceCode.getLocFromIndex(comment.start + msg.textRange.pos);
                        const end = context.sourceCode.getLocFromIndex(comment.start + msg.textRange.end);
                        context.report({
                            loc: { start, end },
                            messageId: 'tsdocSyntax',
                            data: {
                                messageId: msg.messageId,
                                message: msg.unformattedText,
                            },
                        });
                    }
                }
            },
        };
    },
};
