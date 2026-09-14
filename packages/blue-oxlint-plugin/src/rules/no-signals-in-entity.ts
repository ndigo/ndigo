/**
 * Rule that flags `@blue/signals` imports inside `@blue/orm` entity files.
 * * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

const signalsImportPattern = /^@blue\/signals(?:\/|$)/u;
const ENTITY_DECORATOR = 'entity';

function isEntityFile(filename: string): boolean {
    return /[\\/]src[\\/].*\.(ts|tsx)$/u.test(filename);
}

/**
 * Reports signals imports in files that declare `@entity` classes.
 */
export const noSignalsInEntity = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow @blue/signals imports in ORM entity files',
        },
        messages: {
            signalsInEntity:
                "Do not import '@blue/signals' in an ORM entity file — entities describe persisted columns, not reactive state. Keep signals for component/service state (ARCHITECTURE.md §Paradigm Selection Rules).",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const filename = context.filename ?? context.getFilename?.() ?? '';
        if (!isEntityFile(filename)) {
            return {};
        }

        let declaresEntity = false;
        const signalImports: ESTree.StringLiteral[] = [];

        return {
            before() {
                declaresEntity = false;
                signalImports.length = 0;
            },
            ImportDeclaration(node: ESTree.ImportDeclaration) {
                if (signalsImportPattern.test(node.source.value)) {
                    // Defer the report to Program:exit — the entity class
                    // declarations may not have been visited yet.
                    signalImports.push(node.source);
                }
            },
            ClassDeclaration(node: ESTree.Class) {
                for (const decorator of node.decorators ?? []) {
                    const expression = decorator.expression;
                    if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
                        if (expression.callee.name === ENTITY_DECORATOR) {
                            declaresEntity = true;
                        }
                    } else if (expression.type === 'Identifier' && expression.name === ENTITY_DECORATOR) {
                        declaresEntity = true;
                    }
                }
            },
            'Program:exit'() {
                if (!declaresEntity) return;
                for (const source of signalImports) {
                    context.report({
                        node: source,
                        messageId: 'signalsInEntity',
                    });
                }
            },
        };
    },
};
