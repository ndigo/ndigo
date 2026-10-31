/**
 * Configuration metadata shared by the `@configurationProperties` decorator
 * and the config-introspection tooling (`@blue/inspect`).
 *
 * Hosts the metadata-key and resolver-key machinery that binding
 * (`@blue/boot`'s `resolveConfigurationProperties`) and declaration probing
 * (`declaredConfigurationProperties`) both consume, so tooling does not have
 * to pull the whole boot layer (REU-9). The public functions are re-exported
 * from `@blue/boot` unchanged for API continuity.
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';

/** Metadata-key constants and helpers shared with `@blue/boot`'s binding
 * (and its schema decorator) — the metadata keys are written by the context
 * decorators and read here, so they live with the writer. */

/** The `@configurationProperties` class prefix marker (`boot:configurationProperties:prefix`). */
export const CONFIG_PROPS_PREFIX = 'boot:configurationProperties:prefix';

/** The relaxed-binding opt-in marker (`boot:configurationProperties:relaxed`). */
export const CONFIG_PROPS_RELAXED = 'boot:configurationProperties:relaxed';

/** The schema-mode marker (`boot:configurationProperties:schema`, a zod type). */
export const CONFIG_PROPS_SCHEMA = 'boot:configurationProperties:schema';

/** Field-level property metadata keys (set by the context decorators). */
export const PROPERTY_KEY = 'config:property:';
export const DEFAULT_KEY = 'config:defaultValue:';
export const NESTED_KEY = 'config:nested:';
export const PROPERTY_KEY_TYPE = 'config:propertyType:';

/**
 * Reads configuration metadata from a class constructor.
 */
export function getMetadata(target: unknown): Record<string, unknown> {
    return (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
}

/**
 * A configuration property declared by a `@configurationProperties` class.
 *
 * Deliberately value-free: it describes what a class *declares*, never what
 * the environment currently holds.
 */
export interface DeclaredConfigurationProperty {
    /** The full environment keypath (`prefix.field`, e.g. `server.port`). */
    key: string;
    /** The declared conversion target (`number`/`boolean`/`date`/`string`), when derivable. */
    type?: string;
}

/**
 * The conversion target a `@property(path, Type)` field declares, as the
 * binding path resolves it (a string typeverbatim, a constructor lowercased).
 */
function declaredTypeOf(declared: unknown): string | undefined {
    if (typeof declared === 'string') return declared;
    if (typeof declared === 'function') return declared.name.toLowerCase();
    return undefined;
}

/**
 * Collect a class instance's declared keys into `into`, recursing through
 * `@nestedConfig` fields (the field name is the sub-prefix, mirroring
 * {@link resolveConfigurationProperties}).
 */
function collectDeclaredProperties(
    instance: Record<string, unknown>,
    prefix: string | undefined,
    into: Map<string, string | undefined>
): void {
    const meta = getMetadata(instance.constructor as new () => unknown);
    for (const fieldName of Object.getOwnPropertyNames(instance)) {
        if (meta[`${NESTED_KEY}${fieldName}`] === true) {
            const nestedInstance = instance[fieldName];
            if (nestedInstance !== null && typeof nestedInstance === 'object') {
                collectDeclaredProperties(
                    nestedInstance as Record<string, unknown>,
                    prefix ? `${prefix}.${fieldName}` : fieldName,
                    into
                );
            }
            continue;
        }
        const fieldPath = meta[`${PROPERTY_KEY}${fieldName}`] as string | undefined;
        if (!fieldPath) continue;
        const key = prefix ? `${prefix}.${fieldPath}` : fieldPath;
        if (!into.has(key)) into.set(key, declaredTypeOf(meta[`${PROPERTY_KEY_TYPE}${fieldName}`]));
    }
}

/**
 * Metadata-only declared-key enumeration, used when the class constructor
 * throws and no instance can be built to introspect. The field name is
 * embedded in each metadata key (`config:property:<field>` /
 * `config:nested:<field>`), so the top-level keys are still recoverable.
 *
 * DEPTH LIMIT: an `@nestedConfig` subtree lives in the nested class's own metadata,
 * unreachable without an instance, so a nested field contributes only its
 * top-level key (`prefix.field`) — no descendants. The instance path (a
 * constructor that does not throw) recurses fully.
 */
function collectDeclaredPropertiesFromMetadata(
    meta: Record<string, unknown>,
    prefix: string | undefined,
    into: Map<string, string | undefined>
): void {
    for (const metaKey of Object.keys(meta)) {
        if (metaKey.startsWith(NESTED_KEY)) {
            const fieldName = metaKey.slice(NESTED_KEY.length);
            const key = prefix ? `${prefix}.${fieldName}` : fieldName;
            if (!into.has(key)) into.set(key, undefined);
            continue;
        }
        if (!metaKey.startsWith(PROPERTY_KEY)) continue;
        const fieldPath = meta[metaKey];
        // `@property` stores the keypath string; other `config:property*`
        // keys (`config:property:source` from `@propertySource`, the
        // `config:propertyType:` type entry) carry other shapes and are not
        // field declarations.
        if (typeof fieldPath !== 'string') continue;
        const fieldName = metaKey.slice(PROPERTY_KEY.length);
        const key = prefix ? `${prefix}.${fieldPath}` : fieldPath;
        if (!into.has(key)) into.set(key, declaredTypeOf(meta[`${PROPERTY_KEY_TYPE}${fieldName}`]));
    }
}

/** zod def-type discriminants (the `ZodFirstPartyTypeKind` names) → declared conversion target. */
const SCHEMA_KIND_TARGETS: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'date',
    object: 'object',
    array: 'array',
};

/** zod wrapper kinds whose value type is their inner type's kind (`.default()` et al.). */
const ZOD_WRAPPER_KINDS: Record<string, true> = {
    default: true,
    optional: true,
    nullable: true,
    readonly: true,
};

/**
 * The declared conversion target for a zod shape field. zod v4 ships
 * `ZodFirstPartyTypeKind` as a deprecated empty stub, so the first-party kind
 * is read structurally from the type's definition discriminant (`_def.type`),
 * which carries the same enum names. Transparent wrappers (`default`,
 * `optional`, `nullable`, `readonly`) are unwrapped to their inner type — a
 * `z.coerce.number().default(3000)` field is still `number`. A kind outside
 * the mapped set (or an absent discriminant) yields `undefined`: the type is
 * omitted, never guessed.
 */
function declaredTypeFromSchema(field: unknown): string | undefined {
    let node = field;
    // Bounded walk: wrapper chains are short; the cap guards a malformed/cyclic def.
    for (let depth = 0; depth < 8; depth++) {
        if (typeof node !== 'object' || node === null || !('_def' in node)) return undefined;
        const def = node._def;
        if (typeof def !== 'object' || def === null) return undefined;
        if (!('type' in def) || typeof def.type !== 'string') return undefined;
        if (ZOD_WRAPPER_KINDS[def.type] === true) {
            if (!('innerType' in def)) return undefined;
            node = def.innerType;
            continue;
        }
        return SCHEMA_KIND_TARGETS[def.type];
    }
    return undefined;
}

/**
 * Enumerate the configuration keys a `@configurationProperties` class declares,
 * without resolving any value.
 *
 * Field mode walks `@property` fields (plus `@nestedConfig` sub-objects); schema
 * mode walks the `schema` shape keys and maps each zod type to its declared
 * conversion target. Keys are the same full keypaths binding uses
 * (`prefix.field`), deduplicated and sorted. This is the introspection seam
 * for tooling that must list declared configuration without touching the
 * environment — and so without ever exposing a value.
 *
 * When a field-mode class's constructor throws, enumeration falls back to
 * metadata: top-level keys are still listed, but `@nestedConfig` subtrees are
 * limited to their top-level key (see `collectDeclaredPropertiesFromMetadata`).
 *
 * @param ctor - The configuration properties class constructor.
 * @returns The declared keys, sorted by key, with the declared type when known.
 */
export function declaredConfigurationProperties(ctor: new () => unknown): DeclaredConfigurationProperty[] {
    const meta = getMetadata(ctor);
    const prefix = meta[CONFIG_PROPS_PREFIX] as string | undefined;
    const schema = meta[CONFIG_PROPS_SCHEMA] as z.ZodObject | undefined;
    const declared = new Map<string, string | undefined>();

    if (schema) {
        for (const key of Object.keys(schema.shape)) {
            declared.set(prefix ? `${prefix}.${key}` : key, declaredTypeFromSchema(schema.shape[key]));
        }
    } else {
        try {
            const instance = new (ctor as new () => Record<string, unknown>)();
            collectDeclaredProperties(instance, prefix, declared);
        } catch {
            // A throwing constructor still declares its keys via metadata;
            // fall back to metadata-only enumeration (nested subtrees are
            // listed by their top-level key only — no recursion).
            collectDeclaredPropertiesFromMetadata(meta, prefix, declared);
        }
    }

    return [...declared]
        .map(([key, type]) => (type === undefined ? { key } : { key, type }))
        .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/**
 * Normalizes a key for relaxed binding: kebab/snake → camel (`host-name` /
 * `host_name` → `hostName`). Exact keypaths are the default; this only runs
 * when a class opts in via `{ relaxed: true }` (AD-15 Q8).
 */
const camelize = (key: string): string => key.replace(/[-_]([a-z])/g, (_match, letter: string) => letter.toUpperCase());

/**
 * The candidate environment keys `valueAt` probes for a dotted key under
 * relaxed binding, exact key first, then its camelCase, kebab-case and
 * snake_case spellings — each rewritten to resolver-safe form via
 * `toLookupKey` and de-duplicated (a spelling that equals the exact key
 * collapses). This is the single definition of the relaxed candidate set, so
 * declaration probing (`@blue/inspect`) and binding cannot drift apart.
 *
 * @param key - The dotted keypath as declared (e.g. `server.hostName`).
 * @returns The lookup-ready candidate keys, exact key first.
 */
export function relaxedKeyCandidates(key: string): string[] {
    return dedupeLookups([
        key,
        camelize(key),
        key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
    ]);
}

/** Rewrites each spelling to a lookup key, dropping duplicates (first wins). */
function dedupeLookups(spellings: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const spelling of spellings) {
        const lookup = toLookupKey(spelling);
        if (seen.has(lookup)) continue;
        seen.add(lookup);
        out.push(lookup);
    }
    return out;
}

/**
 * Rewrites a keypath into resolver-safe form: the keypath parser stops at a
 * hyphen (it is not an identifier character), so a hyphenated segment must be
 * expressed as a quoted bracket access (`server.host-name` →
 * `server["host-name"]`). Every other segment is passed through untouched, so
 * existing bracket syntax (`arr[1]`) is preserved (CTX-01).
 *
 * @param key - The dotted keypath.
 * @returns The equivalent keypath the environment can resolve.
 */
export function toLookupKey(key: string): string {
    let lookup = '';
    for (const segment of key.split('.')) {
        const part = segment.includes('-') ? `["${segment}"]` : segment;
        // Bracket segments attach directly (`server["host-name"]`); every
        // other segment keeps its dot separator.
        lookup += lookup === '' || part.startsWith('[') ? part : `.${part}`;
    }
    return lookup;
}
