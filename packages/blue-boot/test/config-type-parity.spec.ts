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
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { TelemetryConfig } from '@blue/telemetry-node';
// The `ManagementAutoConfigurationOptions` interface is not re-exported from
// the `@blue/management` barrel, so read the real type from its source module
// (the same cross-package test-import pattern used elsewhere in the repo).
import type { ManagementAutoConfigurationOptions as ManagementOptions } from '../../blue-management/src/management-auto-configuration';

interface SchemaNode {
    properties?: Record<string, SchemaNode>;
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

describe('schema ⇄ option-type parity (BOOT-4)', () => {
    test('telemetry.* schema keys are a subset of TelemetryConfig keys', () => {
        const unknown = schemaKeysOf('telemetry').filter((key) => !TELEMETRY_TYPE_KEYS.some((known) => known === key));
        expect(unknown, `schema telemetry keys not in TelemetryConfig: ${unknown.join(', ') || '(none)'}`).toEqual([]);
    });

    test('management.* schema keys are a subset of ManagementAutoConfigurationOptions keys', () => {
        const unknown = schemaKeysOf('management').filter(
            (key) => !MANAGEMENT_TYPE_KEYS.some((known) => known === key)
        );
        expect(
            unknown,
            `schema management keys not in ManagementAutoConfigurationOptions: ${unknown.join(', ')}`
        ).toEqual([]);
    });

    test('both sections document at least one key (the parity check is not vacuous)', () => {
        expect(schemaKeysOf('telemetry').length).toBeGreaterThan(0);
        expect(schemaKeysOf('management').length).toBeGreaterThan(0);
    });
});
