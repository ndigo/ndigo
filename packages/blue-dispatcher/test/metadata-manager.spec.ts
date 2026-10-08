/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import metadataManager, { MetadataScanner } from '../src/metadata-manager';

/**
 * TC39 Decorator Migration Tests
 *
 * These tests verify that MetadataScanner correctly reads Symbol.metadata
 * instead of the legacy Reflect.defineMetadata API.
 */

describe('metadataManager', () => {
    describe('MetadataScanner', () => {
        let metadataScanner: MetadataScanner;
        let target: Record<string, unknown> | undefined;

        // Create a test class with TC39 metadata
        class Target {
            static [Symbol.metadata] = {
                'request:mapping:handleEveryone': true,
                'request:mapping:handleWorld': function () {},
            };

            handleEveryone() {}
            handleWorld() {}
        }

        // Instance target with method-level metadata
        class InstanceTarget {
            static [Symbol.metadata] = {
                'error:handler:errorHandler': 10,
                'error:handler:errorHandler2': 'madeupvalue',
                'different:metadata:errorHandler2': 'anothermadeupcalue',
            };

            errorHandler() {}
            errorHandler2() {}
        }

        beforeEach(() => {
            target = new InstanceTarget() as unknown as Record<string, unknown>;
        });

        afterEach(() => {
            target = undefined;
            metadataScanner = undefined as unknown as MetadataScanner;
        });

        test('it should be a class that returns an instance', () => {
            metadataScanner = new MetadataScanner();
            expect(MetadataScanner).toBeInstanceOf(Function);
            expect(metadataScanner).toBeTypeOf('object');
            expect(metadataScanner.get).toBeTypeOf('function');
            expect(metadataScanner.clear).toBeTypeOf('function');
        });

        test('it should populate an empty cache and then return the requested metadata', () => {
            metadataScanner = new MetadataScanner(Target.prototype as unknown as Record<string, unknown>);

            expect(metadataScanner._cache.size).toBe(0);
            expect(metadataScanner.get('request:mapping')).toEqual(['handleEveryone', 'handleWorld']);
            expect(metadataScanner._cache.size).toBe(1);
        });

        test("it should prime the cache once with all the metadata defined on the target's properties", () => {
            metadataScanner = new MetadataScanner(target as Record<string, unknown>);
            expect(metadataScanner._cache.size).toBe(0);

            // prime the cache by asking for one key
            metadataScanner.get('error:handler');

            expect(metadataScanner._cache.size).toBe(2);
            expect(metadataScanner.get('error:handler')).toEqual(['errorHandler', 'errorHandler2']);
            expect(metadataScanner._cache.size).toBe(2);
            expect(metadataScanner.get('different:metadata')).toEqual(['errorHandler2']);
            expect(metadataScanner._cache.size).toBe(2);
        });

        test("it should return undefined if metadata isn't in cache", () => {
            metadataScanner = new MetadataScanner(target);
            // prime the cache
            metadataScanner.get('error:handler');

            expect(metadataScanner.get('it shouldnt:exist')).toBeUndefined();
        });

        test('it should clear the cache', () => {
            metadataScanner = new MetadataScanner(target);
            metadataScanner.get('error:handler');

            // Cache is primed with all metadata keys: 'error:handler' and 'different:metadata'
            expect(metadataScanner._cache.size).toBe(2);
            metadataScanner.clear();
            expect(metadataScanner._cache.size).toBe(0);
        });

        test('it should handle class-level metadata (no property suffix)', () => {
            class ClassLevelTarget {
                static [Symbol.metadata] = {
                    'route:mapping': '/api',
                    'route:mapping:getUsers': '/users',
                };
                getUsers() {}
            }

            metadataScanner = new MetadataScanner(ClassLevelTarget as unknown as Record<string, unknown>);
            const classLevel = metadataScanner.get('route:mapping');

            // Should return both class-level (empty string) and method-level (property names)
            expect(classLevel).toBeDefined();
            expect(classLevel).toContain(''); // Class-level
            expect(classLevel).toContain('getUsers'); // Method-level
        });

        test('it should work with constructor as target', () => {
            metadataScanner = new MetadataScanner(Target as unknown as Record<string, unknown>);
            expect(metadataScanner.get('request:mapping')).toEqual(['handleEveryone', 'handleWorld']);
        });

        test('it should work with instance as target', () => {
            const instance = new Target();
            metadataScanner = new MetadataScanner(instance as unknown as Record<string, unknown>);
            expect(metadataScanner.get('request:mapping')).toEqual(['handleEveryone', 'handleWorld']);
        });

        test('it should return undefined for target without Symbol.metadata', () => {
            class NoMetadata {}
            metadataScanner = new MetadataScanner(NoMetadata as unknown as Record<string, unknown>);
            expect(metadataScanner.get('any:key')).toBeUndefined();
        });
    });

    let target: Record<string, unknown> | undefined;
    let scannerMapGetSpy: ReturnType<typeof vi.spyOn> | undefined;

    // Test MetadataManager with TC39 metadata
    class MappingTarget {
        static [Symbol.metadata] = {
            'request:mapping:handleMapping': true,
            'request:mapping:handleSurprise': 10,
            'error:handling:handleError': function () {},
        };

        handleMapping() {}
        handleError() {}
        handleSurprise() {}
    }

    beforeEach(() => {
        target = new MappingTarget() as unknown as Record<string, unknown>;
        scannerMapGetSpy = vi.spyOn(metadataManager._scannerMap, 'get');
    });

    afterEach(() => {
        target = undefined;
        scannerMapGetSpy?.mockRestore();
    });

    test("it should return undefined if metadata isn't set anywhere in the object", () => {
        expect(metadataManager.get(target as Record<string, unknown>, 'doesnot:exist')).toBeUndefined();
    });

    test('it should return properties on an object that have metadata', () => {
        // add target object MetadataScanner to WeakMap
        expect(metadataManager.get(target as Record<string, unknown>, 'request:mapping')).toEqual([
            'handleMapping',
            'handleSurprise',
        ]);
        expect(scannerMapGetSpy).toHaveBeenCalledTimes(0);

        // get metadata properties from target object via WeakMap
        expect(metadataManager.get(target as Record<string, unknown>, 'error:handling')).toEqual(['handleError']);
        expect(scannerMapGetSpy).toHaveBeenCalledTimes(1);
    });

    test('it should cache scanners in WeakMap', () => {
        const result1 = metadataManager.get(target as Record<string, unknown>, 'request:mapping');
        const result2 = metadataManager.get(target as Record<string, unknown>, 'request:mapping');

        expect(result1).toEqual(result2);
        // First call creates scanner (0 calls), second call uses cached scanner (1 call)
        expect(scannerMapGetSpy).toHaveBeenCalledTimes(1);
    });
});
