/**
 * Rule that flags duplicate route-mapping paths within a class.
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/**
 * Route-mapping decorators whose first argument names a path.
 */
const MAPPING_DECORATORS: Record<string, true> = {
    routeMapping: true,
    requestMapping: true,
    getMapping: true,
    postMapping: true,
    putMapping: true,
    deleteMapping: true,
    patchMapping: true,
};

/**
 * A path string extracted from a mapping decorator, with its provenance.
 */
interface MappingPathLiteral {
    readonly decorator: string;
    readonly path: string;
    readonly node: ESTree.StringLiteral;
}

/**
 * Returns whether an AST argument node is a string literal.
 *
 * @param node - The argument node to test.
 * @returns `true` when the node is a string literal.
 */
function isStringLiteral(node: ESTree.Argument | null | undefined): node is ESTree.StringLiteral {
    return node !== null && node !== undefined && node.type === 'Literal' && typeof node.value === 'string';
}

/**
 * Canonicalizes a route mapping path to the radix node it registers at.
 *
 * Mirrors the dispatcher's `RadixMetadataHandlerMapping.normalizePattern`:
 * empty segments are dropped (`/foo` ≡ `/foo/` ≡ `//foo`) and `{name}` param
 * segments are folded to `:name` (`/a/:id` ≡ `/a/{id}`), while param labels
 * remain distinct (`:id` ≠ `:userId`). Distinct spellings normalize to one
 * node, so they would shadow each other on registration.
 *
 * @param path - The raw route mapping path.
 * @returns The canonical key for the path's radix node.
 */
function normalizeMappingPath(path: string): string {
    const segments: string[] = [];
    let start = path.charCodeAt(0) === 47 /* '/' */ ? 1 : 0;
    const length = path.length;
    for (let index = start; index <= length; index++) {
        if (index === length || path.charCodeAt(index) === 47) {
            if (index > start) {
                segments.push(path.slice(start, index));
            }
            start = index + 1;
        }
    }
    if (segments.length === 0) {
        return '/';
    }
    return `/${segments
        .map((segment) => {
            if (segment.startsWith('{*') && segment.endsWith('}')) {
                return `*:${segment.slice(2, -1)}`;
            }
            if (segment.startsWith(':')) {
                return `:${segment.slice(1)}`;
            }
            if (segment.startsWith('{') && segment.endsWith('}')) {
                return `:${segment.slice(1, -1)}`;
            }
            return segment;
        })
        .join('/')}`;
}

/**
 * Extracts the mapping path from a decorator, when it is a static string.
 *
 * Handles both the direct-string form (`@getMapping('/a')`) and the
 * configuration form (`@routeMapping({ value: '/a' })`). Dynamic expressions
 * (identifiers, templates) are not statically known and are skipped.
 *
 * @param decorator - The decorator to inspect.
 * @returns The path literal metadata, or `null` when the decorator is not a
 *   mapping decorator or its path is dynamic.
 */
function mappingPathLiteral(decorator: ESTree.Decorator): MappingPathLiteral | null {
    const expression = decorator.expression;
    if (expression.type !== 'CallExpression') {
        return null;
    }
    const callee = expression.callee;
    let name: string | null = null;
    if (callee.type === 'Identifier') {
        name = callee.name;
    } else if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
        name = callee.property.name;
    }
    if (name === null || MAPPING_DECORATORS[name] === undefined) {
        return null;
    }

    const firstArgument = expression.arguments[0];
    if (isStringLiteral(firstArgument)) {
        return { decorator: name, path: firstArgument.value, node: firstArgument };
    }
    if (firstArgument !== undefined && firstArgument.type === 'ObjectExpression') {
        // The configuration form only carries a path when `value` is its sole
        // property. Any other key (`matrixParams`, `params`, `produces`, …)
        // conditions the registration and disambiguates it from a sibling,
        // so it is not statically comparable here.
        let valueNode: ESTree.StringLiteral | null = null;
        for (const property of firstArgument.properties) {
            if (property.type !== 'Property' || property.computed) {
                return null;
            }
            const key = property.key;
            const keyName =
                key.type === 'Identifier'
                    ? key.name
                    : key.type === 'Literal' && typeof key.value === 'string'
                      ? key.value
                      : null;
            if (keyName !== 'value' || !isStringLiteral(property.value)) {
                return null;
            }
            valueNode = property.value;
        }
        if (valueNode !== null) {
            return { decorator: name, path: valueNode.value, node: valueNode };
        }
    }
    return null;
}

/**
 * Reports duplicate method-level mapping paths within one class.
 *
 * The dispatcher's radix registration model keys by the normalized path, so
 * two method registrations of the same decorator kind whose spellings
 * normalize to the same node (`/foo` and `/foo/`, `/a/:id` and `/a/{id}`)
 * target the same node and shadow each other. Distinct parameter labels
 * (`/a/:id` vs `/a/:name`) are different nodes and are not flagged.
 *
 * Conservative narrowing:
 *
 * - Class-level decorators are ignored: a class-level path is a prefix merged
 *   with its method paths (`RouteMappingInfo.merge`), not a registration of
 *   its own, so `@requestMapping('/')` + `@getMapping('/')` is not a duplicate.
 * - Registrations are grouped by normalized path AND decorator kind: a
 *   `@getMapping('/x')` and a `@postMapping('/x')` differ by HTTP method and
 *   are not duplicates.
 * - A configuration-form decorator is only compared when `value` is its sole
 *   property; any additional condition (`matrixParams`, `params`, `produces`,
 *   …) disambiguates the registration.
 *
 * Scope is best-effort and class-local: only mapping decorators syntactically
 * attached to methods of a single class declaration are compared. Paths
 * composed dynamically, or contributed by a base class, are not seen.
 */
export const noDuplicateMappingPath = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow duplicate method-level route-mapping paths of the same kind within a class',
        },
        messages: {
            duplicateMappingPath:
                "Duplicate @{{decorator}} mapping path '{{path}}' (normalized '{{normalized}}') — already mapped by @{{decorator}}('{{first}}') in this class. Both target the same radix node, so the later registration shadows the earlier; remove or disambiguate one.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkClass(node: ESTree.Class): void {
            const seen = new Map<string, MappingPathLiteral>();
            const record = (decorator: ESTree.Decorator): void => {
                const literal = mappingPathLiteral(decorator);
                if (literal === null) {
                    return;
                }
                const normalized = normalizeMappingPath(literal.path);
                // Same radix node AND same decorator kind (same HTTP method
                // family) — otherwise the registrations disambiguate.
                const key = `${literal.decorator}\u0000${normalized}`;
                const previous = seen.get(key);
                if (previous === undefined) {
                    seen.set(key, literal);
                    return;
                }
                context.report({
                    node: literal.node,
                    messageId: 'duplicateMappingPath',
                    data: {
                        decorator: literal.decorator,
                        path: literal.path,
                        normalized,
                        first: previous.path,
                    },
                });
            };

            for (const element of node.body.body) {
                if (element.type !== 'MethodDefinition') {
                    continue;
                }
                for (const decorator of element.decorators ?? []) {
                    record(decorator);
                }
            }
        }

        return {
            ClassDeclaration(node: ESTree.Class) {
                checkClass(node);
            },
            ClassExpression(node: ESTree.Class) {
                checkClass(node);
            },
        };
    },
};
