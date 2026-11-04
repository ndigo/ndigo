/**
 * BOOT-5 / BOOT-CFG-07: a REAL `config/application.json` +
 * `application-{profile}.json` pair, loaded through
 * {@link StandardConfigFileLoader} and validated against the shipped editor
 * schema — the convention the `.vscode` `fileMatch`, the guide and the schema
 * document, exercised end-to-end (including a `{cipher:…}` string marker and a
 * profile deep-merge).
 * @module ndigo-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { StandardEnvironment } from '@ndigo/context';
import { StandardConfigFileLoader } from '../src/index';

const FIXTURE_DIR = fileURLToPath(new URL('./fixtures/config/', import.meta.url));
const SCHEMA_PATH = new URL('../schema/application.schema.json', import.meta.url);

const reader = async (path: string): Promise<string | null> => (existsSync(path) ? readFileSync(path, 'utf-8') : null);

describe('config-file fixtures (BOOT-5)', () => {
    test('loads application.json + application-dev.json, deep-merges the profile, and validates against the schema', async () => {
        const environment = new StandardEnvironment();
        environment.activeProfiles = ['dev'];
        const loader = new StandardConfigFileLoader({ reader, locations: [FIXTURE_DIR] });

        const loaded = await loader.load(environment);
        expect(loaded).toBe(2); // base + dev profile

        // Deep-merge: base keys survive, profile scalars override.
        expect(environment.getProperty('server.name')).toBe('fixture-api'); // base kept
        expect(environment.getProperty('server.port')).toBe(9090); // dev override
        expect(environment.getProperty('features.alpha')).toBe(true); // base kept
        expect(environment.getProperty('features.beta')).toBe(2); // dev override
        expect(environment.getProperty('features.gamma')).toEqual(['x', 'y']); // dev adds
        expect(environment.getProperty('api.secretToken')).toBe('{cipher:v1:BBBB}'); // profile marker wins

        // The merged document validates against the shipped schema.
        const merged = environment.getPropertySources().get('application')?.properties as Record<string, unknown>;
        const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
        const compiled = z.fromJSONSchema(schema as Parameters<typeof z.fromJSONSchema>[0]);
        const result = compiled.safeParse(merged);
        expect(result.success, JSON.stringify(!result.success ? result.error.issues : [])).toBe(true);

        // The marker is a STRING in the merged model (§8), not an object.
        const marker = (merged.api as Record<string, unknown>).secretToken;
        expect(typeof marker).toBe('string');
        expect(marker).toBe('{cipher:v1:BBBB}');
    });

    test('the base file alone loads without an active profile', async () => {
        const environment = new StandardEnvironment();
        const loader = new StandardConfigFileLoader({ reader, locations: [FIXTURE_DIR] });

        expect(await loader.load(environment)).toBe(1);
        expect(environment.getProperty('server.port')).toBe(8080); // base value, no dev override
    });
});
