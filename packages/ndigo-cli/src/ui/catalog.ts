/**
 * A2UI catalog projection over the ndigo-ui registry and the items an
 * application actually installed (`ui.lock.json`). No A2UI dependency: the
 * catalog is plain JSON Schema.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { usageError } from '../helpers/app-scripts.js';
import { UI_LOCK_FILE } from './config.js';
import type { LoadedRegistry, LocatedRegistryItem } from './registry-types.js';

/** The JSON Schema dialect the catalog document declares. */
export const CATALOG_SCHEMA = 'https://json-schema.org/draft/2020-12/schema';

/** The A2UI specification version this projection targets. */
export const CATALOG_PROTOCOL_VERSION = '1.0';

/** Stable catalog id: the name of the installed design system. */
export const CATALOG_ID = 'ndigo-ui';

/** One component definition in the A2UI catalog. */
export interface A2uiComponentDescriptor {
    /** Every A2UI component is a JSON object. */
    readonly type: 'object';
    /** Human-readable description shown to the agent. */
    readonly description: string;
    /** JSON Schema properties of the component payload. */
    readonly properties: Record<string, unknown>;
    /** Required payload keys. */
    readonly required: readonly string[];
    /** The registry item this component maps to. */
    readonly 'x-ndigo-item': string;
    /** The custom-element tag, when the item is a behaviour element. */
    readonly 'x-ndigo-element'?: string;
    /** The registry item type (`registry:ui` or `registry:block`). */
    readonly 'x-ndigo-type': string;
}

/** The A2UI catalog document. */
export interface A2uiCatalog {
    /** JSON Schema dialect. */
    readonly $schema: string;
    /** Unique catalog identifier. */
    readonly catalogId: string;
    /** A2UI protocol version. */
    readonly protocolVersion: string;
    /** Component definitions keyed by component name. */
    readonly components: Record<string, A2uiComponentDescriptor>;
    /** The `anyComponent` union used by A2UI payloads. */
    readonly $defs: {
        readonly anyComponent: {
            readonly oneOf: readonly { readonly $ref: string }[];
            readonly discriminator: { readonly propertyName: 'component' };
        };
    };
}

/**
 * Reads the item names recorded in the application's `ui.lock.json`.
 *
 * @param dir - Application directory.
 * @returns The installed item names, sorted.
 */
export function readInstalledItems(dir: string): string[] {
    return Object.keys(readLock(dir).items).sort();
}

/**
 * Reads the registry source recorded with the installed items.
 *
 * @param dir - Application directory.
 * @returns The first recorded registry source, or `undefined`.
 */
export function readInstalledRegistry(dir: string): string | undefined {
    const values = Object.values(readLock(dir).items);
    for (const value of values) {
        if (typeof value !== 'object' || value === null || !('registry' in value)) continue;
        const registry = value.registry;
        if (typeof registry === 'string' && registry.length > 0) return registry;
    }
    return undefined;
}

interface LockShape {
    readonly items: Readonly<Record<string, unknown>>;
}

function readLock(dir: string): LockShape {
    const path = join(dir, UI_LOCK_FILE);
    if (!existsSync(path)) {
        throw usageError(`no ${UI_LOCK_FILE} in ${dir} — install items with \`ndigo ui add\` first`);
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        throw usageError(`invalid JSON in ${path}`);
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw usageError(`${UI_LOCK_FILE} must contain a JSON object`);
    }
    if (!('items' in parsed)) {
        throw usageError(`${UI_LOCK_FILE} has no items object`);
    }
    const items = parsed.items;
    if (typeof items !== 'object' || items === null || Array.isArray(items)) {
        throw usageError(`${UI_LOCK_FILE} .items must be a JSON object`);
    }
    return { items: items as Readonly<Record<string, unknown>> }; // validated object shape above
}

/**
 * Builds the A2UI catalog from the registry and the installed item names.
 * Only `registry:ui` and `registry:block` items are renderable components;
 * themes and libraries install supporting files but never appear.
 *
 * @param registry - The loaded registry.
 * @param installed - Item names from `ui.lock.json`.
 * @returns The catalog document.
 */
export function buildCatalog(registry: LoadedRegistry, installed: readonly string[]): A2uiCatalog {
    const byName = new Map(registry.items.map((item) => [item.name, item]));
    const missing = installed.filter((name) => !byName.has(name));
    if (missing.length > 0) {
        throw usageError(`${UI_LOCK_FILE} lists items the registry does not declare: ${missing.join(', ')}`);
    }
    const items = installed
        .map((name) => byName.get(name))
        .filter(
            (item): item is LocatedRegistryItem =>
                item !== undefined && (item.type === 'registry:ui' || item.type === 'registry:block')
        )
        .sort((left, right) => left.name.localeCompare(right.name));
    const components = Object.fromEntries(items.map((item) => [componentName(item.name), descriptor(item)]));
    const names = Object.keys(components);
    return {
        $schema: CATALOG_SCHEMA,
        catalogId: CATALOG_ID,
        protocolVersion: CATALOG_PROTOCOL_VERSION,
        components,
        $defs: {
            anyComponent: {
                oneOf: names.map((name) => ({ $ref: `#/components/${name}` })),
                discriminator: { propertyName: 'component' },
            },
        },
    };
}

function componentName(itemName: string): string {
    return itemName
        .split(/[-_]/u)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function descriptor(item: LocatedRegistryItem): A2uiComponentDescriptor {
    const name = componentName(item.name);
    return {
        type: 'object',
        description: item.description ?? item.title ?? item.name,
        properties: {
            component: { const: name, description: 'The catalog component to render.' },
            id: { type: 'string', description: 'Surface-unique component id.' },
            props: {
                type: 'object',
                description: item.docs ?? `${item.title ?? item.name} properties.`,
                additionalProperties: true,
            },
        },
        required: ['component', 'id'],
        'x-ndigo-item': item.name,
        ...(item.type === 'registry:ui' ? { 'x-ndigo-element': `nd-${item.name}` } : {}),
        'x-ndigo-type': item.type,
    };
}
