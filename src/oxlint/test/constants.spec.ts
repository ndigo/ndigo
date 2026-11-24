/**
 * Guards the integration-layer registry: every owner has a declared kind, and
 * every mapped library points at one of those owners.
 */
import { describe, expect, it } from 'vitest';

import { INTEGRATION_LAYER_KINDS, INTEGRATION_LAYER_MAP, INTEGRATION_LAYER_PACKAGES } from '../_constants.ts';

describe('integration-layer constants', () => {
    it('declares a kind for every integration layer package', () => {
        expect(Object.keys(INTEGRATION_LAYER_KINDS).sort()).toEqual([...INTEGRATION_LAYER_PACKAGES].sort());
    });

    it('maps every encapsulated library to a declared owner', () => {
        for (const owners of Object.values(INTEGRATION_LAYER_MAP)) {
            const names = typeof owners === 'string' ? [owners] : owners;
            for (const name of names) {
                expect(INTEGRATION_LAYER_KINDS[name]).toBeDefined();
            }
        }
    });
});
