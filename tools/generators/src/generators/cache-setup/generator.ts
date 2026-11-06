/**
 * `cache-setup` generator — wires @ndigo/cache into an application.
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface CacheSetupGeneratorSchema {
    /** Application directory (repo-relative or absolute). */
    directory: string;
}

export default async function cacheSetupGenerator(tree: Tree, schema: CacheSetupGeneratorSchema): Promise<void> {
    generateFiles(tree, join(__dirname, 'files'), schema.directory, {
        capability: 'cache',
        tmpl: '',
    });
    await formatFiles(tree);
}
