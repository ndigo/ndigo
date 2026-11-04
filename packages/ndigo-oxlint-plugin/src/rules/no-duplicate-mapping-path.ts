/**
 * Rule that flags duplicate route-mapping paths within a class.
 * @module ndigo-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/**
 * Mapping decorators whose first argument names a path, keyed to the HTTP
 * method identity the registration resolves to.
 *
 * The dispatcher registers every one of these in the same radix tree, so the
 * key for a collision is `(canonical path, HTTP-method identity)`:
 *
 * - `routeMapping` and `requestMapping` are method-less; an absent `method`
 *   means "any method" (`route-mapping.ts` documents `method?:` as
 *   "absent = any method"), and `requestMapping` delegates straight to
 *   `routeMapping(route)` — so both resolve to the `any` identity.
 * - `getMapping`/`postMapping`/`putMapping`/`deleteMapping`/`patchMapping`/
 *   `queryMapping` are `verbDecorator(method, …)` sugar over `requestMapping`
 *   with the method fixed (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, and the
 *   RFC 9889 `QUERY` verb respectively).
 * - `publicMapping`/`privateMapping` delegate to
 *   `routeMapping({ value, private })` — method-less, so `any`; the
 *   `private` flag does not change the radix node.
 * - `socketMapping`/`stompMapping` register through `routeMapping(route)`
 *   (method-less) as well, and the Node adapter resolves them from the very
 *   same tree — `#findSocketHandler` calls `dispatcher.getHandler(route)` and
 *   only *then* asks `isSocketMapping`. They therefore occupy the same radix
 *   node space as HTTP routes and are treated as `any`.
 *
 * Two registrations shadow each other only when both the canonical radix node
 * AND the HTTP-method identity match: `@getMapping('/x')` and
 * `@postMapping('/x')` occupy different method slots and coexist.
 */
const DECORATOR_METHOD: Record<string, string> = {
    routeMapping: 'ANY',
    requestMapping: 'ANY',
    publicMapping: 'ANY',
    privateMapping: 'ANY',
    socketMapping: 'ANY',
    stompMapping: 'ANY',
    getMapping: 'GET',
    postMapping: 'POST',
    putMapping: 'PUT',
    deleteMapping: 'DELETE',
    patchMapping: 'PATCH',
    queryMapping: 'QUERY',
};

/**
 * A path string extracted from a mapping decorator, with its provenance.
 */
interface MappingPathLiteral {
    readonly decorator: string;
    readonly method: string;
    readonly path: string;
    readonly node: ESTree.StringLiteral | ESTree.TemplateLiteral;
}

/**
 * Extracts the statically-known path from an argument node.
 *
 * Accepts a plain string literal and a no-substitution template literal
 * (`` `/a/b` ``) — the latter is a literal at runtime, so it is a legitimate,
 * statically-comparable spelling. A template with substitutions, an identifier,
 * or any other expression is not statically known.
 *
 * @param node - The argument or property-value node to inspect.
 * @returns The path value and its node, or `null` when not static.
 */
function staticPathArgument(
    node: ESTree.Argument | null | undefined
): { value: string; node: ESTree.StringLiteral | ESTree.TemplateLiteral } | null {
    if (node === null || node === undefined) {
        return null;
    }
    if (node.type === 'Literal' && typeof node.value === 'string') {
        return { value: node.value, node };
    }
    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
        const quasi = node.quasis[0];
        if (quasi !== undefined) {
            return { value: quasi.value.cooked ?? quasi.value.raw, node };
        }
    }
    return null;
}

/**
 * Canonicalizes a route mapping path to the radix node it registers at.
 *
 * Mirrors `canonicalizeRouteMappingPath` (ndigo-dispatcher) exactly — the single
 * source of truth shared by the dispatcher and this rule: empty segments are
 * dropped (`/foo` ≡ `/foo/` ≡ `//foo`), `{name}` param segments are folded to
 * `:name` (`/a/:id` ≡ `/a/{id}`), greedy segments are folded to `*:label`
 * (`{*name}` → `*:name`, while the non-capturing `{*}` and `**` collapse to
 * `*:`), and param labels remain distinct (`:id` ≠ `:userId`). Distinct
 * spellings normalize to one node, so they would shadow each other on
 * registration.
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
            if (segment === '**') {
                return '*:';
            }
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
 * Collects the local-name → canonical-decorator alias edges declared at module
 * scope, so decorator identifiers can be resolved through their import binding.
 *
 * Follows renamed imports (`import { getMapping as g }`) and local aliases
 * (`const x = getMapping`, including chains such as `const y = x`). The edges
 * are stored unresolved; {@link resolveDecoratorName} walks them.
 *
 * @param body - The program's top-level statements.
 * @returns A map from a local identifier to the identifier it aliases.
 */
function collectAliasEdges(body: readonly (ESTree.Statement | ESTree.Directive)[]): Map<string, string> {
    const aliases = new Map<string, string>();
    for (const statement of body) {
        let declaration: ESTree.Statement | ESTree.Directive = statement;
        if (statement.type === 'ExportNamedDeclaration' && statement.declaration !== null) {
            declaration = statement.declaration;
        }
        if (declaration.type === 'ImportDeclaration') {
            for (const specifier of declaration.specifiers) {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
                    aliases.set(specifier.local.name, specifier.imported.name);
                }
            }
            continue;
        }
        if (declaration.type === 'VariableDeclaration') {
            for (const declarator of declaration.declarations) {
                if (declarator.id.type === 'Identifier' && declarator.init?.type === 'Identifier') {
                    aliases.set(declarator.id.name, declarator.init.name);
                }
            }
        }
    }
    return aliases;
}

/**
 * Resolves an identifier to a canonical mapping-decorator name, following any
 * import/alias edges.
 *
 * @param name - The identifier referenced at the decorator site.
 * @param aliases - The alias edges collected from module scope.
 * @returns The canonical decorator name, or `null` when `name` does not resolve
 *   to a known mapping decorator.
 */
function resolveDecoratorName(name: string, aliases: Map<string, string>): string | null {
    const seen = new Set<string>();
    let current = name;
    while (!seen.has(current)) {
        if (DECORATOR_METHOD[current] !== undefined) {
            return current;
        }
        const next = aliases.get(current);
        if (next === undefined) {
            return null;
        }
        seen.add(current);
        current = next;
    }
    return null;
}

/**
 * Extracts the mapping path from a decorator, when it is a static string.
 *
 * Handles the direct-string form (`@getMapping('/a')`), the no-substitution
 * template form (`` @getMapping(`/a`) ``), the configuration form
 * (`@routeMapping({ value: '/a' })`), and aliased callees (`@g('/a')` where `g`
 * is an import or `const` alias of a mapping decorator). Dynamic expressions
 * (identifiers, templates with substitutions) are not statically known and are
 * skipped.
 *
 * @param decorator - The decorator to inspect.
 * @param aliases - The alias edges collected from module scope.
 * @returns The path literal metadata, or `null` when the decorator is not a
 *   mapping decorator or its path is dynamic.
 */
function mappingPathLiteral(decorator: ESTree.Decorator, aliases: Map<string, string>): MappingPathLiteral | null {
    const expression = decorator.expression;
    if (expression.type !== 'CallExpression') {
        return null;
    }
    const callee = expression.callee;
    let referenced: string | null = null;
    if (callee.type === 'Identifier') {
        referenced = callee.name;
    } else if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
        referenced = callee.property.name;
    }
    if (referenced === null) {
        return null;
    }
    const decoratorName = resolveDecoratorName(referenced, aliases);
    if (decoratorName === null) {
        return null;
    }
    const method = DECORATOR_METHOD[decoratorName];

    const firstArgument = expression.arguments[0];
    const direct = staticPathArgument(firstArgument);
    if (direct !== null) {
        return { decorator: decoratorName, method, path: direct.value, node: direct.node };
    }
    if (firstArgument !== undefined && firstArgument.type === 'ObjectExpression') {
        // The configuration form only carries a path when `value` is its sole
        // property. Any other key (`matrixParams`, `params`, `produces`,
        // `method`, …) conditions the registration and disambiguates it from a
        // sibling, so it is not statically comparable here.
        let valueNode: ESTree.StringLiteral | ESTree.TemplateLiteral | null = null;
        let value = '';
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
            if (keyName !== 'value') {
                return null;
            }
            const condition = staticPathArgument(property.value);
            if (condition === null) {
                return null;
            }
            valueNode = condition.node;
            value = condition.value;
        }
        if (valueNode !== null) {
            return { decorator: decoratorName, method, path: value, node: valueNode };
        }
    }
    return null;
}

/**
 * Reports duplicate method-level mapping paths within one class.
 *
 * The dispatcher's radix registration model keys by the normalized path, so
 * two method registrations with the same HTTP-method identity whose spellings
 * normalize to the same node (`/foo` and `/foo/`, `/a/:id` and `/a/{id}`)
 * target the same node and shadow each other. Distinct parameter labels
 * (`/a/:id` vs `/a/:name`) are different nodes and are not flagged.
 *
 * Grouping is by resolved HTTP-method identity (see {@link DECORATOR_METHOD}),
 * not by decorator name, so the method-less forms collapse into one family:
 * `@requestMapping('/y')` and `@routeMapping('/y')` shadow each other, as do
 * `@publicMapping`/`@privateMapping`/`@socketMapping`/`@stompMapping`.
 *
 * Conservative narrowing:
 *
 * - Class-level decorators are ignored: a class-level path is a prefix merged
 *   with its method paths (`RouteMappingInfo.merge`), not a registration of
 *   its own, so `@requestMapping('/')` + `@getMapping('/')` is not a duplicate.
 * - Registrations are grouped by normalized path AND HTTP-method identity: a
 *   `@getMapping('/x')` and a `@postMapping('/x')` differ by method and are not
 *   duplicates.
 * - A configuration-form decorator is only compared when `value` is its sole
 *   property; any additional condition (`matrixParams`, `params`, `produces`,
 *   `method`, …) disambiguates the registration.
 *
 * Scope is best-effort and class-local: only mapping decorators syntactically
 * attached to methods of a single class declaration are compared. Paths
 * composed dynamically, or contributed by a base class, are not seen.
 */
export const noDuplicateMappingPath = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow duplicate method-level route-mapping paths of the same HTTP-method identity within a class',
        },
        messages: {
            duplicateMappingPath:
                "Duplicate @{{decorator}} mapping path '{{path}}' (normalized '{{normalized}}', method {{method}}) — already mapped by @{{firstDecorator}}('{{first}}') in this class. Both target the same radix node for the same HTTP method, so the later registration shadows the earlier; remove or disambiguate one.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        let aliases = new Map<string, string>();

        function checkClass(node: ESTree.Class): void {
            const seen = new Map<string, MappingPathLiteral>();
            const record = (decorator: ESTree.Decorator): void => {
                const literal = mappingPathLiteral(decorator, aliases);
                if (literal === null) {
                    return;
                }
                const normalized = normalizeMappingPath(literal.path);
                // Same radix node AND same HTTP-method identity (`any` for the
                // method-less decorators) — otherwise the registrations
                // disambiguate.
                const key = `${literal.method}\u0000${normalized}`;
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
                        firstDecorator: previous.decorator,
                        path: literal.path,
                        normalized,
                        method: literal.method,
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
            Program(node: ESTree.Program) {
                aliases = collectAliasEdges(node.body);
            },
            ClassDeclaration(node: ESTree.Class) {
                checkClass(node);
            },
            ClassExpression(node: ESTree.Class) {
                checkClass(node);
            },
        };
    },
};
