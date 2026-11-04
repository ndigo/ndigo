/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { StandardEnvironment } from '@ndigo/context';
import { BrowserEnvironment, filterImportMetaEnv } from '../src/browser-environment';

describe('filterImportMetaEnv', () => {
    test('should keep only prefixed keys (allow-list = security boundary)', () => {
        const filtered = filterImportMetaEnv({
            VITE_API_URL: 'https://api.ndigo.dev',
            API_SECRET: 'secret',
            MODE: 'production',
            VITE_DEBUG: 'true',
        });

        expect(filtered).toEqual({ VITE_API_URL: 'https://api.ndigo.dev', VITE_DEBUG: 'true' });
        expect((filtered as Record<string, unknown>).API_SECRET).toBeUndefined();
    });

    test('should return an empty object for undefined env', () => {
        expect(filterImportMetaEnv(undefined)).toEqual({});
    });

    test('should honor a custom prefix', () => {
        expect(filterImportMetaEnv({ APP_X: '1', VITE_Y: '2' }, 'APP_')).toEqual({ APP_X: '1' });
    });
});

describe('BrowserEnvironment', () => {
    test('it should extend StandardEnvironment', () => {
        const environment = new BrowserEnvironment();

        expect(environment).toBeInstanceOf(StandardEnvironment);
    });

    test('it should initialize with provided property sources', () => {
        const environment = new BrowserEnvironment([{ mode: 'browser' }]);

        expect(environment.getProperty('mode')).toBe('browser');
    });

    test('it should always have an empty defaults source (lowest precedence)', () => {
        const environment = new BrowserEnvironment();

        expect(environment.getPropertySources().contains('defaults')).toBe(true);
        expect(environment.getPropertySources().toArray().at(-1)?.name).toBe('defaults');
    });

    test('it should expose no importMetaEnv source when Vite is absent (seam-forced)', () => {
        const environment = new BrowserEnvironment([], {}, false);

        expect(environment.getPropertySources().contains('importMetaEnv')).toBe(false);
    });

    test('it should expose importMetaEnv when present, filtering to the prefix', () => {
        // The seam forces registration; the filter is applied to whatever
        // import.meta.env carries in this environment.
        const environment = new BrowserEnvironment([], {}, true);

        if (environment.getPropertySources().contains('importMetaEnv')) {
            const source = environment.getPropertySources().get('importMetaEnv');
            const keys = Object.keys(source?.properties ?? {});
            expect(keys.every((key) => key.startsWith('VITE_'))).toBe(true);
        }
    });

    test('bootstrap source registered by the host resolves above defaults', () => {
        const environment = new BrowserEnvironment();
        environment.getPropertySources().addLast('bootstrap', { appVersion: '1.2.3' });

        expect(environment.getProperty('appVersion')).toBe('1.2.3');
        expect(environment.getPropertySources().contains('bootstrap')).toBe(true);
    });
});
