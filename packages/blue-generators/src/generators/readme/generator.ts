/**
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ReadmeGeneratorSchema {
    /** Package name (kebab-case, without the `blue-` prefix). */
    name: string;
    /** Short one-line description used in the intro paragraph. */
    description?: string;
    /** Destination directory for the README (defaults to `packages/blue-<name>`). */
    path?: string;
}

/**
 * Scaffolds a new package README on the BlueJS standard template: a value-first
 * intro, runnable examples, and the canonical section order. The generated file
 * is a skeleton — authors replace the bracketed placeholders with real content.
 */
export default async function readmeGenerator(tree: Tree, schema: ReadmeGeneratorSchema): Promise<void> {
    const { name, description } = schema;

    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`README name must be kebab-case: "${name}"`);
    }

    const projectRoot = schema.path ?? `packages/blue-${name}`;

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        name,
        description: description || 'A BlueJS package',
        // Marker Nx uses to rename template files (README.md.template -> README.md).
        tmpl: '',
    });

    await formatFiles(tree);
}
