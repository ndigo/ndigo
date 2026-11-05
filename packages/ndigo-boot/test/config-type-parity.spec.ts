/**
 * Schema ⇄ option-type parity (BOOT-4). The editor schema's framework sections
 * are hand-maintained (no generator); this spec keeps them tracking the option
 * types they mirror, so a rename in `TelemetryConfig` /
 * `ManagementAutoConfigurationOptions` cannot silently rot the schema while the
 * guide↔schema guard stays green.
 *
 * Direction: the schema documents a SUBSET of each option type's keys, and
 * every schema key must be a real key of that type (adding a bogus schema key,
 * or a type rename that drops a documented key, turns this red).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { TelemetryConfig } from '@ndigo/telemetry-node';
// The `ManagementAutoConfigurationOptions` interface is not re-exported from
// the `@ndigo/management` barrel, so read the real type from its source module
// (the same cross-package test-import pattern used elsewhere in the repo).
import type { ManagementAutoConfigurationOptions as ManagementOptions } from '../../ndigo-management/src/management-auto-configuration';

interface SchemaNode {
    properties?: Record<string, SchemaNode>;
    'x-ndigo-read-from-config'?: boolean;
}

const SCHEMA_PATH = new URL('../schema/application.schema.json', import.meta.url);
const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8')) as SchemaNode;

/**
 * The option-type keys each section mirrors, typed `keyof <type>` so a rename
 * anywhere in the type breaks this list at compile time (run `tsc` over the
 * spec; the repo's `pnpm typecheck` covers build config only — TST-A).
 */
const TELEMETRY_TYPE_KEYS: Array<keyof TelemetryConfig> = [
    'traceExporter',
    'metricExporter',
    'logExporter',
    'sampler',
    'instrumentations',
    'minimumSeverity',
];
const MANAGEMENT_TYPE_KEYS: Array<keyof ManagementOptions> = ['accessGuard', 'redactHealthErrors'];

const schemaKeysOf = (namespace: string): string[] => Object.keys(schema.properties?.[namespace]?.properties ?? {});

/**
 * The schema keys of a section that carry the constructor-option annotation
 * (`x-ndigo-read-from-config: false`) — the only ones mirroring an option
 * type, post AD-76 D-5 (the read-from-config keys are NOT options).
 */
const annotatedKeysOf = (namespace: string): string[] =>
    Object.entries(schema.properties?.[namespace]?.properties ?? {})
        .filter(([, node]) => node['x-ndigo-read-from-config'] === false)
        .map(([key]) => key);

describe('schema ⇄ option-type parity (BOOT-4)', () => {
    test('telemetry.* schema keys are a subset of TelemetryConfig keys', () => {
        const unknown = schemaKeysOf('telemetry').filter((key) => !TELEMETRY_TYPE_KEYS.some((known) => known === key));
        expect(unknown, `schema telemetry keys not in TelemetryConfig: ${unknown.join(', ') || '(none)'}`).toEqual([]);
    });

    test('management.* constructor-option keys are a subset of ManagementAutoConfigurationOptions keys', () => {
        const optionKeys = annotatedKeysOf('management');
        const unknown = optionKeys.filter((key) => !MANAGEMENT_TYPE_KEYS.some((known) => known === key));
        expect(
            unknown,
            `annotated management keys not in ManagementAutoConfigurationOptions: ${unknown.join(', ')}`
        ).toEqual([]);
    });

    test('config-read management keys are not constructor options (AD-76 D-5)', () => {
        for (const key of ['endpoints', 'health']) {
            const isOption = MANAGEMENT_TYPE_KEYS.some((known) => known === key);
            expect(isOption, `${key} is read from config (AD-76 D-5), not a constructor option`).toBe(false);
        }
    });

    test('both sections document at least one key (the parity check is not vacuous)', () => {
        expect(schemaKeysOf('telemetry').length).toBeGreaterThan(0);
        expect(annotatedKeysOf('management').length).toBeGreaterThan(0);
    });
});
