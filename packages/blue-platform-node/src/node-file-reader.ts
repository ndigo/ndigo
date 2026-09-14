/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { readFile } from 'node:fs/promises';
import type { ConfigFileReader } from '@blue/context';

/**
 * `fs`-backed {@link ConfigFileReader} for the config-file loader seam
 * (AD-13 Q1): returns the file's text content, or `null` when missing.
 *
 * This is the Node-side implementation of the seam that keeps `@blue/boot`
 * isomorphic (boot never imports `node:fs`; the reader is injected).
 */
export const nodeFileReader: ConfigFileReader = async (path: string): Promise<string | null> => {
    try {
        return await readFile(path, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error; // propagate real read errors (permissions, etc.)
    }
};
