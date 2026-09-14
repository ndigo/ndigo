/**
 * Rule that flags cross-paradigm decorator misuse.
 * * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

const CALL_DECORATORS = new Set([
    'service', // @service is the class-level client marker
    'getCall',
    'postCall',
    'putCall',
    'deleteCall',
    'patchCall',
    'queryCall',
]);

const MAPPING_DECORATORS = new Set([
    'routeMapping',
    'requestMapping',
    'getMapping',
    'postMapping',
    'putMapping',
    'deleteMapping',
    'patchMapping',
    'queryMapping',
    'publicMapping',
    'privateMapping',
]);

function decoratorNames(node: { decorators?: ESTree.Decorator[] }): string[] {
    const names: string[] = [];
    for (const decorator of node.decorators ?? []) {
        const expression = decorator.expression;
        if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
            names.push(expression.callee.name);
        } else if (expression.type === 'Identifier') {
            names.push(expression.name);
        } else if (expression.type === 'CallExpression' && expression.callee.type === 'MemberExpression') {
            // e.g. @blue.mapping(...) — keep the property name
            const property = expression.callee.property;
            if (property.type === 'Identifier') names.push(property.name);
        }
    }
    return names;
}

/**
 * Reports classes mixing service-call and server-route-mapping decorators (on
 * the class OR any of its methods).
 */
export const noCrossParadigmDecorators = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow mixing service-call and route-mapping decorators on one class',
        },
        messages: {
            mixedParadigms:
                "Class '{{name}}' mixes {{call}} (service-call decorator) with {{mapping}} (route-mapping decorator). Use @service/@*Call for client service calls and @routeMapping/@*Mapping for server handlers — never both on one class.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkClass(node: ESTree.Class): void {
            if (!node.id) return;
            const names = decoratorNames(node);
            // Also scan method-level decorators
            for (const element of node.body?.body ?? []) {
                if ('decorators' in element) {
                    names.push(
                        ...decoratorNames({ decorators: (element as { decorators?: ESTree.Decorator[] }).decorators })
                    );
                }
            }
            const call = names.find((n) => CALL_DECORATORS.has(n));
            const mapping = names.find((n) => MAPPING_DECORATORS.has(n));
            if (call && mapping) {
                context.report({
                    node: node.id,
                    messageId: 'mixedParadigms',
                    data: {
                        name: node.id.name,
                        call,
                        mapping,
                    },
                });
            }
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ClassDeclaration(node: ESTree.Class) {
                checkClass(node);
            },
        };
    },
};
