/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Contract for `schema/application.schema.json` — the permissive editor schema
 * for the `./config/application.json` + `application-{profile}.json`
 * convention. Compiles the schema with `z.fromJSONSchema` (zod v4) and asserts
 * the documented sample validates, a wrong-typed `server.port` fails, and
 * every framework key documented in the guide's key table exists in the
 * schema (drift guard).
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { z } from 'zod';

/** Minimal structural view of the schema node tree used by the drift guard. */
interface SchemaNode {
    $schema?: string;
    type?: string;
    additionalProperties?: unknown;
    properties?: Record<string, SchemaNode>;
    $defs?: Record<string, SchemaNode>;
    'x-blue-read-from-config'?: boolean;
}

const SCHEMA_PATH = new URL('../schema/application.schema.json', import.meta.url);
const GUIDE_PATH = new URL('../../../docs/guides/03-environment-configuration.md', import.meta.url);

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8')) as SchemaNode;
const compiled = z.fromJSONSchema(schema as Parameters<typeof z.fromJSONSchema>[0]);

const document = (key: string): SchemaNode => {
    let node: SchemaNode = schema;
    for (const segment of key.split('.').filter((part) => !part.startsWith('<'))) {
        const next = node.properties?.[segment];
        expect(next, `schema is missing documented key "${key}" (segment "${segment}")`).toBeDefined();
        node = next as SchemaNode;
    }
    return node;
};

/** Framework key paths listed in the guide's documented-keys table. */
const documentedKeys = (): string[] =>
    [...readFileSync(GUIDE_PATH, 'utf-8').matchAll(/^\|\s*`((?:server|profiles|telemetry|management)\.[^`]+)`/gm)].map(
        (match) => match[1]
    );

/**
 * List 1 — schema keypaths READ FROM CONFIG by a real repo path (reader cited).
 * Every entry must name the code that consumes the key.
 */
const READ_FROM_CONFIG: Record<string, string> = {
    'server.name': "apps/04-blue-api/src/server-config.ts — @configurationProperties('server', { schema })",
    'server.port': "apps/04-blue-api/src/server-config.ts — @configurationProperties('server', { schema })",
};

/**
 * List 2 — namespaces annotated `"x-blue-read-from-config": false`: their keys
 * are programmatic options (CLI/env/builder/constructor argument), never read
 * from `config/application.json`.
 */
const NOT_READ_NAMESPACES = ['profiles', 'telemetry', 'management'];

describe('application.schema.json', () => {
    test('is a 2020-12 object schema, permissive for app keys', () => {
        expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(schema.additionalProperties).toBe(true);
    });

    test('compiles with z.fromJSONSchema', () => {
        expect(compiled.safeParse({}).success).toBe(true);
    });

    test('a documented sample validates (numbers, profile arrays, cipher marker, unknown app key)', () => {
        const sample = {
            server: { port: 8080, host: 'localhost' },
            profiles: { active: ['prod'], group: { short: ['dev', 'test'] } },
            telemetry: { sampler: { ratio: 0.1 }, logExporter: 'none' },
            management: { redactHealthErrors: false },
            // {cipher:…} secret marker — a marker STRING, not an ordinary object value.
            api: { secretToken: '{cipher:v1:AAAA}' },
            // Unknown application key — the schema is permissive by design.
            customFeature: { enabled: true, retries: 3 },
        };

        const result = compiled.safeParse(sample);
        expect(result.success, JSON.stringify(!result.success ? result.error.issues : [])).toBe(true);
    });

    test('a profile-variant sample uses the identical schema', () => {
        const profileSample = { server: { port: 9000 }, profiles: { active: ['prod'] } };
        expect(compiled.safeParse(profileSample).success).toBe(true);
    });

    test('a wrong-typed server.port is rejected', () => {
        const result = compiled.safeParse({ server: { port: 'x' } });
        expect(result.success).toBe(false);
        expect(result.success ? [] : result.error.issues.map((issue) => issue.path)).toEqual([['server', 'port']]);
    });

    test('schema properties cover every framework key documented in the guide', () => {
        const keys = documentedKeys();
        expect(keys.length).toBeGreaterThan(0);
        for (const key of keys) {
            document(key);
        }
    });

    test('the secret marker is a string pattern; the {cipher:…} object form is rejected', () => {
        const markerDef = schema.$defs?.secretMarker;
        expect(markerDef?.type).toBe('string');
        const marker = z.fromJSONSchema(markerDef as Parameters<typeof z.fromJSONSchema>[0]);
        // String markers pass: scheme[:version]:payload.
        expect(marker.safeParse('{cipher:v1:AAAA}').success).toBe(true);
        expect(marker.safeParse('{cipher:AAAA}').success).toBe(true);
        // The inert object form the schema used to teach is NOT a marker.
        expect(marker.safeParse({ cipher: 'v1:AAAA' }).success).toBe(false);
        // Ordinary strings are not markers either (the pattern is anchored).
        expect(marker.safeParse('plain-secret').success).toBe(false);
        expect(marker.safeParse('{Cipher:v1:AAAA}').success).toBe(false);
    });

    test('every schema property is read from config or annotated x-blue-read-from-config:false', () => {
        for (const [namespace, node] of Object.entries(schema.properties ?? {})) {
            // An annotated namespace covers all its keys; otherwise each child
            // must be a cited read path or carry the annotation itself.
            if (node['x-blue-read-from-config'] === false) continue;
            for (const [key, child] of Object.entries(node.properties ?? {})) {
                const keyPath = `${namespace}.${key}`;
                const covered = READ_FROM_CONFIG[keyPath] !== undefined || child['x-blue-read-from-config'] === false;
                expect(covered, `schema key "${keyPath}" is neither read from config nor annotated`).toBe(true);
            }
        }
    });

    test('exactly the programmatic namespaces are annotated x-blue-read-from-config:false', () => {
        const annotated = Object.entries(schema.properties ?? {})
            .filter(([, node]) => node['x-blue-read-from-config'] === false)
            .map(([namespace]) => namespace)
            .sort();
        expect(annotated).toEqual([...NOT_READ_NAMESPACES].sort());
    });
});
