/**
 * @author Jeff Rose
 */

import { readFile } from 'node:fs/promises';
import { Resource, ResourceLoader, UnresolvedResource } from '@blue/context';

/**
 * File resource backed by the local filesystem.
 */
class FileResource<T = string> implements Resource<T> {
    readonly value: T;

    get exists(): boolean {
        return true;
    }

    constructor(value: T) {
        this.value = value;
    }
}

/**
 * {@link ResourceLoader} implementation that reads files from the local filesystem using
 * `node:fs/promises`. The `location` parameter is treated as a file path.
 *
 * Returns an {@link UnresolvedResource} (with `exists === false`) if the file cannot be read.
 */
export class FileSystemResourceLoader implements ResourceLoader {
    /**
     * Loads a file resource from the given path.
     *
     * @param location - Absolute or relative file path.
     * @returns A resolved {@link Resource} containing the file contents as a string,
     *          or an {@link UnresolvedResource} if the read fails.
     */
    async getResource(location: string): Promise<Resource> {
        try {
            const value = await readFile(location, 'utf-8');
            return new FileResource<string>(value);
        } catch (error) {
            return new UnresolvedResource(location, error as Error);
        }
    }
}