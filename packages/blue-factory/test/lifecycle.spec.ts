import { describe, test, expect } from 'vitest';
import { likeDestroyable, likeInitializable } from '../src/lifecycle';

describe('likeDestroyable', () => {
    test('it should identify destroyables', () => {
        expect(likeDestroyable({ destroy: () => void 0, destroyed: false })).toBe(true);
    });
});

describe('likeInitializable', () => {
    test('it should identify initializables', () => {
        expect(likeInitializable({ init: () => void 0 })).toBe(true);
    });
});
