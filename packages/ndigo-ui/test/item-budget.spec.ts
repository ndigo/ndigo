/**
 * Per-item gzip budget guard: a registry item may not grow past its recorded
 * budget without the author updating `meta.json`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

interface ItemBudget {
    readonly meta: string;
    readonly files: readonly string[];
}

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry'))
);

if (!PACKAGE_ROOT) {
    throw new Error(`Cannot locate packages/ndigo-ui from ${process.cwd()}`);
}

const ITEMS: readonly ItemBudget[] = [
    { meta: 'registry/base/meta.json', files: ['registry/base/base-element.ts', 'registry/base/zag-element.ts'] },
    {
        meta: 'registry/ui/dialog/meta.json',
        files: ['registry/ui/dialog/nd-dialog.ts', 'registry/ui/dialog/nd-dialog.css'],
    },
    {
        meta: 'registry/ui/menu/meta.json',
        files: ['registry/ui/menu/nd-menu.ts', 'registry/ui/menu/nd-menu.css'],
    },
];

describe('registry item budgets', () => {
    for (const item of ITEMS) {
        it(`keeps ${item.meta} within its recorded gzip budget`, () => {
            const meta = JSON.parse(readFileSync(join(PACKAGE_ROOT, item.meta), 'utf8')) as { gzipBytes: number };
            const payload = Buffer.concat(item.files.map((file) => readFileSync(join(PACKAGE_ROOT, file))));
            const actual = gzipSync(payload, { level: 9 }).byteLength;

            expect(meta.gzipBytes).toBeGreaterThan(0);
            expect(actual).toBeLessThanOrEqual(Math.ceil(meta.gzipBytes * 1.05));
        });
    }
});
