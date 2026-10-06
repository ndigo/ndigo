/**
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface PackageGeneratorSchema {
    name: string;
    description?: string;
}

function toPascalCase(str: string): string {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export default async function packageGenerator(tree: Tree, schema: PackageGeneratorSchema): Promise<void> {
    const { name, description } = schema;

    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`Package name must be kebab-case: "${name}"`);
    }

    const projectRoot = `packages/blue-${name}`;
    const className = toPascalCase(name);
    // Manifest gate (`scripts/check-manifests.mjs`): the description must be
    // >= 25 chars and must not be the rejected `Blue <Name>` placeholder.
    const resolvedDescription = description || `${className} — BlueJS framework package`;

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        name,
        className,
        description: resolvedDescription,
        tmpl: '',
    });

    const vitestConfigPath = 'vitest.config.ts';
    const vitestContent = tree.read(vitestConfigPath, 'utf-8');
    if (vitestContent) {
        const aliasEntry = `            { find: /^@blue\\/${name.replace(/-/g, '\\\\-')}$/, replacement: resolve(__dirname, './packages/blue-${name}/src') },`;
        const updatedContent = vitestContent.replace(/(\s*\],\s*\},\s*\}\);)/, `\n${aliasEntry}$1`);
        tree.write(vitestConfigPath, updatedContent);
    }

    await formatFiles(tree);
}
