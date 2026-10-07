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

    const aliasesPath = 'vitest.aliases.ts';
    const aliasesContent = tree.read(aliasesPath, 'utf-8');
    if (aliasesContent) {
        // The shared `blueAliases` table (vitest.aliases.ts) is the single
        // alias source for the root config and every app config (HI-6);
        // manifest-gate rule 11 requires an entry per workspace package.
        // `name` is validated kebab-case (`[a-z0-9-]`), so it is already
        // regex-safe: escaping the hyphen emitted a doubled backslash (`\\-`)
        // that made the alias regex demand a literal `\` and never match the
        // `@blue/<name>` import specifier (TOL-F3).
        const aliasEntry = `    { find: /^@blue\\/${name}$/, replacement: resolve(repoRoot, 'packages/blue-${name}/src') },`;
        const updatedContent = aliasesContent.replace(/\n\];\s*$/, `\n${aliasEntry}\n];\n`);
        if (updatedContent === aliasesContent) {
            throw new Error(
                `Could not locate the blueAliases table in ${aliasesPath} — add the @blue/${name} alias manually`
            );
        }
        tree.write(aliasesPath, updatedContent);
    }

    await formatFiles(tree);
}
