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
    additionalProperties?: unknown;
    properties?: Record<string, SchemaNode>;
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
            // {cipher:…} secret marker — a marker string, not an ordinary object value.
            api: { secretToken: { cipher: 'v1:AAAA' } },
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
});
