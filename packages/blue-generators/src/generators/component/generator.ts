/**
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { toPascal } from '@blue/util/string';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ComponentGeneratorSchema {
    name: string;
    package: string;
    className?: string;
    /** One-line summary used as the description in the doc header. */
    summary?: string;
    /** Value for the `@author` tag (defaults to `Jeff Rose`). */
    author?: string;
}

export default async function componentGenerator(tree: Tree, schema: ComponentGeneratorSchema): Promise<void> {
    const { name, package: pkg, author = 'Jeff Rose' } = schema;
    const className = schema.className || toPascal(name);
    const projectRoot = `packages/blue-${pkg}`;

    if (!tree.exists(`${projectRoot}/package.json`)) {
        throw new Error(`Package not found: ${projectRoot}. Does @blue/${pkg} exist?`);
    }

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        fileName: name,
        className,
        packageName: pkg,
        summary: schema.summary,
        author,
        tmpl: '',
    });

    await formatFiles(tree);
}
