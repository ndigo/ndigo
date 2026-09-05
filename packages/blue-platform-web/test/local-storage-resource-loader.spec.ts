/**
 * @author Jeff Rose
 */

import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { LocalStorageResourceLoader } from '../src/local-storage-resource-loader';

describe('LocalStorageResourceLoader', () => {
    let storage: LocalStorageResourceLoader;

    beforeEach(() => {
        localStorage.clear();
        storage = new LocalStorageResourceLoader('test');
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('setItem stores string value', () => {
        storage.setItem('name', 'World');
        expect(localStorage.getItem('test:name')).toBe('World');
    });

    test('getItem retrieves stored value', () => {
        storage.setItem('name', 'World');
        expect(storage.getItem('name')).toBe('World');
    });

    test('getItem returns null for missing key', () => {
        expect(storage.getItem('nonexistent')).toBeNull();
    });

    test('setItem serializes objects as JSON', () => {
        storage.setItem('config', { theme: 'dark', lang: 'en' });
        expect(storage.getItem('config')).toBe('{"theme":"dark","lang":"en"}');
    });

    test('getJSON retrieves parsed object', () => {
        storage.setItem('config', { theme: 'dark' });
        expect(storage.getJSON<{ theme: string }>('config')).toEqual({ theme: 'dark' });
    });

    test('getJSON returns null for invalid JSON', () => {
        localStorage.setItem('test:bad', 'not-json');
        expect(storage.getJSON('bad')).toBeNull();
    });

    test('removeItem deletes the key', () => {
        storage.setItem('name', 'World');
        storage.removeItem('name');
        expect(storage.getItem('name')).toBeNull();
    });

    test('clear removes only prefixed items', () => {
        localStorage.setItem('other:keep', 'value');
        storage.setItem('name', 'World');
        storage.clear();

        expect(storage.getItem('name')).toBeNull();
        expect(localStorage.getItem('other:keep')).toBe('value');
    });

    test('length returns count of prefixed items', () => {
        expect(storage.length).toBe(0);
        storage.setItem('a', '1');
        storage.setItem('b', '2');
        expect(storage.length).toBe(2);
    });
});
