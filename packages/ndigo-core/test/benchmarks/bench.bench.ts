/**
 */
import { test } from 'vitest';
import { like } from '@ndigo/util/types';
import { FrameworkError } from '@ndigo/core';

// ── Hot path: `like()` duck-typing ────────────────────────────────

const obj = { name: 'test', value: 42, nested: { key: 'val' } };
const likeShape = like({ name: String, value: Number });

test('like() hot path', async ({ bench }) => {
    await bench.compare(
        bench('matches valid shape', () => {
            likeShape(obj);
        }),
        bench('rejects null', () => {
            likeShape(null);
        }),
        bench('rejects mismatched type', () => {
            likeShape({ name: 123, value: 'not' });
        })
    );
});

// ── Hot path: error construction ───────────────────────────────────

test('error construction', async ({ bench }) => {
    await bench.compare(
        bench('FrameworkError', () => {
            new FrameworkError('test error');
        }),
        bench('FrameworkError with cause', () => {
            new FrameworkError('wrapped', new Error('cause'));
        })
    );
});

// ── Hot path: object spread / assign ───────────────────────────────

const base = { a: 1, b: 2, c: 3 };
const override = { b: 99, d: 4 };

test('object merge', async ({ bench }) => {
    await bench.compare(
        bench('object spread', () => {
            void { ...base, ...override };
        }),
        bench('Object.assign', () => {
            Object.assign({}, base, override);
        })
    );
});
