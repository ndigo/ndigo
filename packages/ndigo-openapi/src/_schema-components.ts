/**
 * Schema component hoisting for the OpenAPI generator.
 */
import { z } from 'zod';
import type { OpenAPISchemaObject } from './spec-types.js';
import {
    componentKeyOf,
    containsRootRelativeRef,
    definitionIdOf,
    isRootRelativeRef,
    jsonSchemaOf,
    schemaDefinitionsOf,
} from './_spec-helpers.js';

/**
 * Hoists schemas whose `$ref` pointers are document-root-relative into
 * `components.schemas`, rewriting the pointers to absolute component
 * locations. Embedded inline under `paths`, those pointers resolve against
 * the whole document — `$ref: '#'` even targets the root document object —
 * which no longer denotes the schema (zod's conversion is only valid for a
 * standalone document).
 *
 * One instance per {@link OpenAPISpecGenerator.generate} call: a schema that
 * converts to the same JSON is hoisted once and reused by pointer, and
 * component names are allocated deterministically from the usage site
 * (operation id) or the registered `id`.
 */
export class SchemaComponents {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "SchemaComponents".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object SchemaComponents]"
     */
    get [Symbol.toStringTag](): string {
        return 'SchemaComponents';
    }

    readonly #schemas: Record<string, OpenAPISchemaObject> = {};
    readonly #byRef: Map<string, string> = new Map();
    readonly #names: Set<string> = new Set();

    /** Hoisted components, keyed by component name. */
    get schemas(): Record<string, OpenAPISchemaObject> {
        return this.#schemas;
    }

    /** Number of hoisted components. */
    get size(): number {
        return Object.keys(this.#schemas).length;
    }

    /**
     * Embed a schema at a usage site: returned as converted when it is
     * self-contained, otherwise hoisted and returned as a `$ref` to its
     * component.
     *
     * @param schema - The zod schema to convert.
     * @param hint - Deterministic component-name hint for the usage site.
     * @returns The schema to embed.
     */
    embed(schema: z.ZodType<unknown>, hint: string): OpenAPISchemaObject {
        const converted = jsonSchemaOf(schema);
        if (!containsRootRelativeRef(converted)) return converted;
        return this.#hoist(converted, hint);
    }

    #hoist(converted: OpenAPISchemaObject, hint: string): OpenAPISchemaObject {
        const shape = JSON.stringify(converted);
        const known = this.#byRef.get(shape);
        if (known !== undefined) return { $ref: known };

        const definitions = schemaDefinitionsOf(converted);
        const definitionNames = new Map<string, string>();
        for (const id of definitions.keys()) definitionNames.set(id, this.#allocate(id));

        // A root that is nothing but a pointer into its own definition bundle
        // (zod's `id` shape) already has a component: the promoted definition.
        const rest = { ...converted };
        delete rest['definitions'];
        delete rest['$defs'];
        const bareRefId =
            Object.keys(rest).length === 1 && isRootRelativeRef(rest['$ref'])
                ? definitionIdOf(rest['$ref'])
                : undefined;
        const promotedName = bareRefId === undefined ? undefined : definitionNames.get(bareRefId);
        let rootName: string | undefined;
        let embeddedRef: string;
        if (promotedName !== undefined) {
            embeddedRef = `#/components/schemas/${promotedName}`;
        } else {
            rootName = this.#allocate(hint);
            embeddedRef = `#/components/schemas/${rootName}`;
        }

        const pointerOf = (ref: string): string => {
            if (ref === '#') {
                // A definition referencing the whole schema needs a root
                // component even when the root itself is a bare pointer.
                rootName ??= this.#allocate(hint);
                return `#/components/schemas/${rootName}`;
            }
            const id = definitionIdOf(ref);
            const name = id === undefined ? undefined : definitionNames.get(id);
            return name === undefined ? ref : `#/components/schemas/${name}`;
        };
        const rewrite = (node: unknown): unknown => {
            if (Array.isArray(node)) return node.map(rewrite);
            if (node === null || typeof node !== 'object') return node;
            const copy: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(node)) {
                copy[key] = key === '$ref' && isRootRelativeRef(value) ? pointerOf(value) : rewrite(value);
            }
            return copy;
        };

        for (const [id, definition] of definitions) {
            const name = definitionNames.get(id);
            if (name !== undefined) this.#schemas[name] = rewrite(definition) as OpenAPISchemaObject;
        }
        if (rootName !== undefined) this.#schemas[rootName] = rewrite(rest) as OpenAPISchemaObject;
        this.#byRef.set(shape, embeddedRef);
        return { $ref: embeddedRef };
    }

    #allocate(hint: string): string {
        const base = componentKeyOf(hint);
        let name = base;
        for (let suffix = 2; this.#names.has(name); suffix++) name = `${base}-${suffix}`;
        this.#names.add(name);
        return name;
    }
}
