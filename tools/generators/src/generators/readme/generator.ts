/**
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateKebabName } from '../../_validators.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Options for the `readme` generator: the package name, its short description,
 * and an optional destination directory (defaults to `packages/ndigo-<name>`).
 */
export interface ReadmeGeneratorSchema {
    /** Package name (kebab-case, without the `ndigo-` prefix). */
    name: string;
    /** Short one-line description used in the intro paragraph. */
    description?: string;
    /** Destination directory for the README (defaults to `packages/ndigo-<name>`). */
    path?: string;
}

/**
 * Scaffolds a new package README on the Ndigo standard template: a value-first
 * intro, runnable examples, and the canonical section order. The generated file
 * is a skeleton — authors replace the bracketed placeholders with real content.
 */
export default async function readmeGenerator(tree: Tree, schema: ReadmeGeneratorSchema): Promise<void> {
    const { name, description } = schema;

    validateKebabName(name, 'README name');

    const projectRoot = schema.path ?? `packages/ndigo-${name}`;

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        name,
        description: description || 'A Ndigo package',
        // Marker Nx uses to rename template files (README.md.template -> README.md).
        tmpl: '',
    });

    await formatFiles(tree);
}
