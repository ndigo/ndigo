/**
 * Per-item gzip budget guard: every registry item with a recorded
 * `meta.json` budget may not grow past it without the author updating the
 * metadata. Items and files are derived from `registry.json`, so a new item
 * cannot silently skip the check.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { packageRoot } from './_package-root.js';

interface RegistryFile {
    readonly path: string;
}

interface RegistryItem {
    readonly name: string;
    readonly files?: readonly RegistryFile[];
}

interface Registry {
    readonly items: readonly RegistryItem[];
}

interface ItemBudget {
    readonly name: string;
    readonly meta: string;
    readonly files: readonly string[];
    readonly gzipBytes: number;
}

const PACKAGE_ROOT = packageRoot('registry');

const REGISTRY = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'registry.json'), 'utf8')) as Registry;

function budgetFor(item: RegistryItem): ItemBudget | null {
    const files = (item.files ?? []).map((file) => file.path);
    if (files.length === 0) return null;
    const meta = join(dirname(files[0]), 'meta.json');
    const metaPath = join(PACKAGE_ROOT, meta);
    if (!existsSync(metaPath)) return null;
    const parsed = JSON.parse(readFileSync(metaPath, 'utf8')) as { gzipBytes?: unknown };
    if (typeof parsed.gzipBytes !== 'number') return null;
    return { name: item.name, meta, files, gzipBytes: parsed.gzipBytes };
}

const ITEMS = REGISTRY.items.map(budgetFor).filter((item): item is ItemBudget => item !== null);

function budgetedMetaFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return budgetedMetaFiles(path);
        if (entry.name !== 'meta.json') return [];
        const parsed = JSON.parse(readFileSync(path, 'utf8')) as { gzipBytes?: unknown };
        return typeof parsed.gzipBytes === 'number' ? [path] : [];
    });
}

describe('registry item budgets', () => {
    it('covers every item that records a gzip budget', () => {
        const covered = new Set(ITEMS.map((item) => join(PACKAGE_ROOT, item.meta)));
        const recorded = new Set(budgetedMetaFiles(join(PACKAGE_ROOT, 'registry')));

        expect([...recorded].filter((path) => !covered.has(path))).toEqual([]);
    });

    for (const item of ITEMS) {
        it(`keeps ${item.name} within its recorded gzip budget`, () => {
            const payload = Buffer.concat(item.files.map((file) => readFileSync(join(PACKAGE_ROOT, file))));
            const actual = gzipSync(payload, { level: 9 }).byteLength;

            expect(item.gzipBytes).toBeGreaterThan(0);
            expect(actual).toBeLessThanOrEqual(Math.ceil(item.gzipBytes * 1.05));
        });
    }
});
