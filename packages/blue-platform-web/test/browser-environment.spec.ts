import { describe, expect, test } from 'vitest';
import { StandardEnvironment } from '@blue/context';
import { BrowserEnvironment } from '../src/browser-environment';

describe('BrowserEnvironment', () => {
    test('it should extend StandardEnvironment', () => {
        const environment = new BrowserEnvironment();

        expect(environment).toBeInstanceOf(StandardEnvironment);
    });

    test('it should initialize with provided property sources', () => {
        const environment = new BrowserEnvironment([{ mode: 'browser' }]);

        expect(environment.getProperty('mode')).toBe('browser');
    });
});
