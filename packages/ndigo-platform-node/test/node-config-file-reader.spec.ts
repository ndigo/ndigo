/**
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { nodeConfigFileReader } from '../src/node-config-file-reader';

describe('nodeConfigFileReader', () => {
    let dir: string;

    beforeAll(async () => {
        dir = await mkdtemp(join(tmpdir(), 'ndigo-config-reader-'));
    });

    afterAll(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    test('reads an existing file as UTF-8', async () => {
        const path = join(dir, 'application.json');
        await writeFile(path, '{"a":1}', 'utf8');

        await expect(nodeConfigFileReader(path)).resolves.toBe('{"a":1}');
    });

    test('a missing file resolves to null so the loader probes on', async () => {
        await expect(nodeConfigFileReader(join(dir, 'missing.json'))).resolves.toBeNull();
    });

    test('other filesystem errors rethrow instead of silently skipping config', async () => {
        const subdirectory = join(dir, 'a-directory');
        await mkdir(subdirectory, { recursive: true });

        await expect(nodeConfigFileReader(subdirectory)).rejects.toThrow();
    });
});
