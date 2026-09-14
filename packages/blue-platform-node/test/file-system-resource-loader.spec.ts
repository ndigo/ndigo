/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileSystemResourceLoader } from '../src/file-system-resource-loader';

describe('FileSystemResourceLoader', () => {
    let loader: FileSystemResourceLoader;
    let tmpDir: string;

    beforeEach(async () => {
        loader = new FileSystemResourceLoader();
        tmpDir = await mkdtemp(join(tmpdir(), 'blue-test-'));
    });

    describe('getResource', () => {
        test('should return resource with exists === true and correct value on success', async () => {
            const filePath = join(tmpDir, 'hello.txt');
            await writeFile(filePath, 'hello world');

            const resource = await loader.getResource(filePath);

            expect(resource.exists).toBe(true);
            expect(resource.value).toBe('hello world');
        });

        test('should return resource with exists === false when file is missing', async () => {
            const resource = await loader.getResource(join(tmpDir, 'nonexistent.txt'));

            expect(resource.exists).toBe(false);
        });

        test('should capture the thrown error as the resource value', async () => {
            const resource = await loader.getResource(join(tmpDir, 'nonexistent.txt'));

            expect(resource.exists).toBe(false);
            expect(resource.value).toBeInstanceOf(Error);
        });
    });
});
