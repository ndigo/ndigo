/** @author Jeff Rose */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ComponentGeneratorSchema {
    name: string;
    package: string;
    className?: string;
}

function toPascalCase(str: string): string {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export default async function componentGenerator(tree: Tree, schema: ComponentGeneratorSchema): Promise<void> {
    const { name, package: pkg } = schema;
    const className = schema.className || toPascalCase(name);
    const projectRoot = `packages/blue-${pkg}`;

    if (!tree.exists(`${projectRoot}/package.json`)) {
        throw new Error(`Package not found: ${projectRoot}. Does @blue/${pkg} exist?`);
    }

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        fileName: name,
        className,
        packageName: pkg,
        tmpl: '',
    });

    await formatFiles(tree);
}
