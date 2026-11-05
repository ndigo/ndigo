/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { Resource, ResourceLoader, UnresolvedResource } from '@ndigo/context';

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
 * `ResourceLoader` implementation that reads files from the local filesystem using
 * `node:fs/promises`. The `location` parameter is treated as a file path.
 *
 * Returns an `UnresolvedResource` (with `exists === false`) if the file cannot be read.
 *
 * When constructed with a `root`, every lookup is contained inside that
 * canonical directory: `location` is resolved against it and both the
 * lexical and real (symlink-resolved) paths MUST stay under `root + sep`, so
 * a traversal (`../`) or absolute location resolves to an unresolved resource
 * instead of reading outside the root. Without a `root` the loader stays
 * generic and reads the given path as-is.
 */
export class FileSystemResourceLoader implements ResourceLoader {
    readonly #root: string | null;
    /** Canonical root path, resolved lazily and cached. */
    #base: string | null = null;

    /**
     * @param root - Optional directory that confines every lookup. Pass
     *   `null` (the default) to load arbitrary paths.
     */
    constructor(root: string | null = null) {
        this.#root = root;
    }

    /**
     * Loads a file resource from the given path.
     *
     * @param location - Absolute or relative file path.
     * @returns A resolved `Resource` containing the file contents as a string,
     *          or an `UnresolvedResource` if the read fails or escapes `root`.
     */
    async getResource(location: string): Promise<Resource> {
        try {
            const target = this.#root === null ? location : await this.#contained(location, this.#root);
            const value = await readFile(target, 'utf-8');
            return new FileResource<string>(value);
        } catch (error) {
            return new UnresolvedResource(location, error as Error);
        }
    }

    /**
     * Resolves `location` against the canonical root and rejects anything that
     * escapes it (lexically or through symlinks).
     *
     * @param location - The requested location.
     * @param root - The configured root directory.
     * @returns The canonical, contained path.
     * @throws {Error} When the location escapes the root.
     */
    async #contained(location: string, root: string): Promise<string> {
        if (this.#base === null) {
            this.#base = await realpath(root);
        }
        const base = this.#base;

        const candidate = resolve(base, location);
        // Containment by prefix-with-separator, not bare startsWith.
        if (candidate !== base && !candidate.startsWith(base + sep)) {
            throw new Error(`Refusing to read outside the resource root: ${location}`);
        }

        const real = await realpath(candidate);
        if (real !== base && !real.startsWith(base + sep)) {
            throw new Error(`Refusing to read outside the resource root: ${location}`);
        }
        return real;
    }
}
