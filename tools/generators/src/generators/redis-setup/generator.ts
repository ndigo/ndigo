/**
 * `redis-setup` generator — wires @ndigo/redis into an application.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface RedisSetupGeneratorSchema {
    /** Application directory (repo-relative or absolute). */
    directory: string;
}

export default async function redisSetupGenerator(tree: Tree, schema: RedisSetupGeneratorSchema): Promise<void> {
    generateFiles(tree, join(__dirname, 'files'), schema.directory, {
        capability: 'redis',
        tmpl: '',
    });
    await formatFiles(tree);
}
