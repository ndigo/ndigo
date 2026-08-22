import { describe, bench } from 'vitest';
import { like } from '@blue/util/types';
import { FrameworkError } from '@blue/core';

// ── Hot path: `like()` duck-typing ────────────────────────────────

const obj = { name: 'test', value: 42, nested: { key: 'val' } };
const likeShape = like({ name: String, value: Number });

describe('like() hot path', () => {
    bench('matches valid shape', () => {
        likeShape(obj);
    });

    bench('rejects null', () => {
        likeShape(null);
    });

    bench('rejects mismatched type', () => {
        likeShape({ name: 123, value: 'not' });
    });
});

// ── Hot path: error construction ───────────────────────────────────

describe('error construction', () => {
    bench('FrameworkError', () => {
        new FrameworkError('test error');
    });

    bench('FrameworkError with cause', () => {
        new FrameworkError('wrapped', new Error('cause'));
    });
});

// ── Hot path: object spread / assign ───────────────────────────────

const base = { a: 1, b: 2, c: 3 };
const override = { b: 99, d: 4 };

describe('object merge', () => {
    bench('object spread', () => {
        ({ ...base, ...override });
    });

    bench('Object.assign', () => {
        Object.assign({}, base, override);
    });
});