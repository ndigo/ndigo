/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { toPascal } from '@ndigo/util/string';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ControllerGeneratorSchema {
    name: string;
    package: string;
    className?: string;
    summary?: string;
    author?: string;
}

export default async function controllerGenerator(tree: Tree, schema: ControllerGeneratorSchema): Promise<void> {
    const { name, package: pkg, author = 'Jeff Rose' } = schema;
    const className = schema.className || toPascal(name);
    const projectRoot = `packages/ndigo-${pkg}`;
    if (!tree.exists(`${projectRoot}/package.json`)) {
        throw new Error(`Package not found: ${projectRoot}.`);
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
