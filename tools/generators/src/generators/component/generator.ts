/**
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { toPascal } from '@ndigo/util/string';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Options for the `component` generator: the component name, the package it
 * belongs to (without the `ndigo-` prefix), an optional class name override,
 * and the doc header's summary.
 */
export interface ComponentGeneratorSchema {
    name: string;
    package: string;
    className?: string;
    /** One-line summary used as the description in the doc header. */
    summary?: string;
}

/**
 * Scaffolds a component file in the target package: class name derived from the
 * component name, the canonical doc header, and the package's export list
 * updated to include it.
 */
export default async function componentGenerator(tree: Tree, schema: ComponentGeneratorSchema): Promise<void> {
    const { name, package: pkg } = schema;
    const className = schema.className || toPascal(name);
    const projectRoot = `packages/ndigo-${pkg}`;

    if (!tree.exists(`${projectRoot}/package.json`)) {
        throw new Error(`Package not found: ${projectRoot}. Does @ndigo/${pkg} exist?`);
    }

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        fileName: name,
        className,
        packageName: pkg,
        summary: schema.summary,
        tmpl: '',
    });

    await formatFiles(tree);
}
