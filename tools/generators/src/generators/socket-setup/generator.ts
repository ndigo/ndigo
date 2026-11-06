/**
 * `socket-setup` generator — wires @ndigo/socket into an application.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface SocketSetupGeneratorSchema {
    /** Application directory (repo-relative or absolute). */
    directory: string;
}

export default async function socketSetupGenerator(tree: Tree, schema: SocketSetupGeneratorSchema): Promise<void> {
    generateFiles(tree, join(__dirname, 'files'), schema.directory, {
        capability: 'socket',
        tmpl: '',
    });
    await formatFiles(tree);
}
