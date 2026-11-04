/**
 * Exporter spec resolution (AD-32 D-2/D-3) — pure shape table, no
 * providers touched, so every case runs in one process.
 * @module ndigo-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { resolveExporter } from '../src/node-config';

describe('resolveExporter (AD-32 D-2)', () => {
    test('missing option resolves to the console exporter (dev posture)', () => {
        expect(resolveExporter(undefined, 'trace')).toEqual({ kind: 'console' });
    });

    test("'console' and { console: true } select the console exporter", () => {
        expect(resolveExporter('console', 'trace')).toEqual({ kind: 'console' });
        expect(resolveExporter({ console: true }, 'trace')).toEqual({ kind: 'console' });
        expect(resolveExporter({ url: 'http://localhost:4318/v1/traces', console: true }, 'trace')).toEqual({
            kind: 'console',
        });
    });

    test("'none' disables the signal's export path", () => {
        expect(resolveExporter('none', 'metric')).toEqual({ kind: 'none' });
    });

    test("'prometheus' selects the pull reader for the metric signal (AD-77 D-1)", () => {
        expect(resolveExporter('prometheus', 'metric')).toEqual({ kind: 'prometheus' });
    });

    test("'prometheus' is rejected for trace and log signals, naming the signal", () => {
        expect(() => resolveExporter('prometheus', 'trace')).toThrow(/only valid for the metric exporter/);
        expect(() => resolveExporter('prometheus', 'log')).toThrow('requested for log');
    });

    test('{ url } selects OTLP, preserving url and headers', () => {
        expect(
            resolveExporter(
                { url: 'http://collector:4318/v1/traces', headers: { Authorization: 'Bearer sekret' } },
                'trace'
            )
        ).toEqual({
            kind: 'otlp',
            url: 'http://collector:4318/v1/traces',
            headers: { Authorization: 'Bearer sekret' },
        });
    });

    test('headers without a url still select OTLP (explicit intent), using the default endpoint', () => {
        expect(resolveExporter({ headers: { Authorization: 'Bearer sekret' } }, 'log')).toEqual({
            kind: 'otlp',
            url: undefined,
            headers: { Authorization: 'Bearer sekret' },
        });
    });

    test('invalid urls fail loud, naming the signal', () => {
        expect(() => resolveExporter({ url: 'not a url' }, 'trace')).toThrow('trace exporter url is invalid');
        expect(() => resolveExporter({ url: 'http://' }, 'metric')).toThrow('metric exporter url is invalid');
        expect(() => resolveExporter({ url: '::::' }, 'log')).toThrow('log exporter url is invalid');
    });
});
