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

export interface PackageGeneratorSchema {
    name: string;
    description?: string;
}

export default async function packageGenerator(tree: Tree, schema: PackageGeneratorSchema): Promise<void> {
    const { name, description } = schema;

    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`Package name must be kebab-case: "${name}"`);
    }

    const projectRoot = `packages/blue-${name}`;
    const className = toPascal(name);
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
        // `name` is validated kebab-case (`[a-z0-9-]`), so it is already
        // regex-safe: escaping the hyphen emitted a doubled backslash (`\\-`)
        // that made the alias regex demand a literal `\` and never match the
        // `@blue/<name>` import specifier (TOL-F3).
        const aliasEntry = `            { find: /^@blue\\/${name}$/, replacement: resolve(__dirname, './packages/blue-${name}/src') },`;
        const updatedContent = vitestContent.replace(/(\s*\],\s*\},\s*\}\);)/, `\n${aliasEntry}$1`);
        tree.write(vitestConfigPath, updatedContent);
    }

    await formatFiles(tree);
}
