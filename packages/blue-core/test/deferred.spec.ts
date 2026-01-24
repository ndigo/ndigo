import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Deferred from '../src/deferred';

describe('Deferred', () => {
    let deferred: Deferred<number>;

    beforeEach(() => {
        deferred = new Deferred();
    });

    afterEach(() => {
        deferred = undefined as any;
    });

    test('it should resolve', async () => {
        deferred.resolve(123);
        await expect(deferred.promise).resolves.toEqual(123);
    });

    test('it should reject', async () => {
        deferred.reject(123);
        await expect(deferred.promise).rejects.toEqual(123);
    });
});
