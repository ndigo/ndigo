/**
 * Drift guard: the decorator-lowering plugin ships as a copied script in three
 * places (root tooling + both scaffold templates). They must stay byte-identical.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');

describe('vite-plugin-lower-decorators sync', () => {
    const paths = [
        resolve(ROOT, 'scripts', 'vite-plugin-lower-decorators.mjs'),
        resolve(
            ROOT,
            'packages',
            'create-ndigo-app',
            'templates',
            'browser',
            'scripts',
            'vite-plugin-lower-decorators.mjs'
        ),
        resolve(
            ROOT,
            'packages',
            'create-ndigo-app',
            'templates',
            'node',
            'scripts',
            'vite-plugin-lower-decorators.mjs'
        ),
    ];

    test('all copies are byte-identical', () => {
        const contents = paths.map((path) => readFileSync(path, 'utf8'));
        for (let i = 1; i < contents.length; i++) {
            expect(contents[i]).toBe(contents[0]);
        }
    });
});
