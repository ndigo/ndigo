/**
 * Zod-schema-driven config resolution (AD-34 D3): bind a typed value from a
 * property resolver by declaring the SHAPE once — keys, coercion, required
 * and defaults all come from the schema — instead of per-field decorators.
 *
 * The same parsing semantics back `@configurationProperties(prefix, { schema })`
 * (ndigo-boot) and the environment's `typedConfig` — one module, one behavior.
 */
import { z } from 'zod';
import type { PropertyResolver } from './property-resolver';

/**
 * The resolver surface schema binding needs: flat `getProperty` reads
 * (keypaths included — the resolver handles dotted paths).
 */
export type SchemaConfigResolver = Pick<PropertyResolver, 'getProperty'>;

/**
 * Parses pre-gathered raw values through the schema, applying coercion and
 * defaults. Throws the zod `ZodError` on invalid input — callers decide the
 * failure framing (ndigo-boot wraps it in the fail-loud `IllegalStateError`
 * naming the config class; `typedConfig` lets it propagate).
 *
 * @param schema - The binding schema (a `z.object` shape or a top-level
 *   scalar schema for `resolveSchemaConfig`'s leaf mode).
 * @param raw - The resolved raw values, keyed by schema key.
 * @returns The parsed, typed value.
 */
export function parseSchemaConfig<S extends z.ZodType>(schema: S, raw: Record<string, unknown>): z.infer<S> {
    return schema.parse(raw) as z.infer<S>;
}

/**
 * Resolves raw values for an object-shaped schema from a property resolver.
 *
 * Object shapes map each schema key to `${prefix}.${key}` (`prefix`
 * optional). Absent keys are omitted so the schema's `z.default()` and
 * required checks decide the outcome — a missing required key surfaces as a
 * zod error, not a silent `undefined`.
 *
 * @param schema - The schema to resolve.
 * @param prefix - Property prefix, e.g. `'server'` → `'server.port'`.
 * @param resolver - The property resolver.
 * @returns The parsed typed value.
 * @throws When the resolved values violate the schema.
 */
export function resolveSchemaConfig<S extends z.ZodType>(
    schema: S,
    prefix: string | undefined,
    resolver: SchemaConfigResolver
): z.infer<S> | undefined {
    const shape = (schema as { shape?: Record<string, z.ZodType> }).shape;

    if (shape) {
        const raw: Record<string, unknown> = {};
        for (const key of Object.keys(shape)) {
            const fullPath = prefix ? `${prefix}.${key}` : key;
            const value = resolver.getProperty(fullPath);
            if (value !== undefined) {
                raw[key] = value;
            }
        }
        return parseSchemaConfig(schema, raw);
    }

    // Leaf mode: the value sits at `prefix` itself (e.g. a scalar schema).
    const value = prefix === undefined ? undefined : resolver.getProperty(prefix);
    return value === undefined ? undefined : (schema.parse(value) as z.infer<S>);
}

/**
 * The leaf values {@link PropertyKeyMap} terminates at: any primitive,
 * plus `null`/`undefined`. Everything else is descended into.
 */
export type PrimitiveValue = string | number | boolean | null | undefined;

/**
 * Recursive mapped type materializing the leaf keypaths of a shape —
 * the engine behind {@link PropertyKeyMap}. Leaves become their key path
 * (`'server.port'`); objects descend. Exposed so the keypath shape of a
 * configuration can be reasoned about in types.
 */
export type DeepPropertyKey<T, P extends string> = T extends PrimitiveValue | readonly unknown[]
    ? P
    : { [K in keyof T & string]: DeepPropertyKey<T[K], P extends '' ? K : `${P}.${K}`> };

/**
 * The shape's leaf keypaths, mirroring the shape object: leaves become the
 * joined template-literal path (`{ server: { port: 0 } }` →
 * `'server.port'`), nested objects stay objects.
 */
export type PropertyKeyMap<S extends object> = { [K in keyof S & string]: DeepPropertyKey<S[K], K> };

/**
 * Materializes the shape's leaf keypaths as a plain object — the typed
 * counterpart of `DeepPropertyKeyMap`. Values are placeholders; pass any
 * sample shape: `propertyKeys({ server: { name: '', port: 0 } })`.
 *
 * @param shape - A literal-shaped sample of the configuration object.
 * @returns Leaf keypath strings in the same shape ('server.port').
 */
export function propertyKeys<S extends object>(shape: S): PropertyKeyMap<S> {
    const isLeaf = (value: unknown): boolean => value === null || typeof value !== 'object' || Array.isArray(value);

    const walk = (node: unknown, path: string): Record<string, unknown> => {
        const result: Record<string, unknown> = {};
        if (isLeaf(node)) {
            return result;
        }
        for (const [key, value] of Object.entries(node as object)) {
            const nextPath = path ? `${path}.${key}` : key;
            result[key] = isLeaf(value) ? nextPath : walk(value, nextPath);
        }
        return result;
    };

    return walk(shape, '') as PropertyKeyMap<S>;
}
