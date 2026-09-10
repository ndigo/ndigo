/**
 * Rule that flags cross-paradigm decorator misuse.
 *
 * BlueJS distinguishes *server-side route mapping* (`@routeMapping`,
 * `@getMapping`, `@postMapping`, … — the dispatcher) from *client-side service
 * calls* (`@service`, `@getCall`, `@postCall`, … — the service client). They
 * are two different paradigms and must not be mixed on the same class:
 *
 * - `@getCall`/`@postCall`/… on a `@routeMapping` controller — a service call
 *   made inside a server controller is a paradigm error (client binding on a
 *   request handler).
 * - `@getMapping`/`@postMapping`/… on a `@service` class — a server route on a
 *   service client indicates the wrong abstraction was chosen.
 *
 * Mirrors the A2 anti-pattern enforcement: runtime throws catch metadata
 * misuse; this rule catches the statically-visible paradigm confusion.
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
