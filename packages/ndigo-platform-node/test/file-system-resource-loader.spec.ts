/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { writeFile, mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileSystemResourceLoader } from '../src/file-system-resource-loader';

describe('FileSystemResourceLoader', () => {
    let loader: FileSystemResourceLoader;
    let tmpDir: string;

    beforeEach(async () => {
        loader = new FileSystemResourceLoader();
        tmpDir = await mkdtemp(join(tmpdir(), 'ndigo-test-'));
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

describe('FileSystemResourceLoader with a root', () => {
    let root: string;
    let outside: string;

    beforeEach(async () => {
        const base = await mkdtemp(join(tmpdir(), 'ndigo-rooted-'));
        root = join(base, 'views');
        outside = join(base, 'outside.txt');
        await mkdir(root);
        await writeFile(outside, 'TOP SECRET');
    });

    test('reads a nested file inside the root', async () => {
        await mkdir(join(root, 'admin'));
        await writeFile(join(root, 'admin', 'users.txt'), 'inner');
        const loader = new FileSystemResourceLoader(root);

        const resource = await loader.getResource('admin/users.txt');

        expect(resource.exists).toBe(true);
        expect(resource.value).toBe('inner');
    });

    test('never reads outside the root via relative traversal', async () => {
        const loader = new FileSystemResourceLoader(root);

        const traversal = await loader.getResource('../outside.txt');
        const deeper = await loader.getResource('admin/../../outside.txt');

        expect(traversal.exists).toBe(false);
        expect(deeper.exists).toBe(false);
        expect(traversal.value).not.toBe('TOP SECRET');
    });

    test('never reads outside the root via an absolute path', async () => {
        const loader = new FileSystemResourceLoader(root);

        const resource = await loader.getResource(outside);

        expect(resource.exists).toBe(false);
    });

    test('never reads outside the root through a symlink escape', async () => {
        await symlink(outside, join(root, 'link.txt'));
        const loader = new FileSystemResourceLoader(root);

        const resource = await loader.getResource('link.txt');

        expect(resource.exists).toBe(false);
    });
});
