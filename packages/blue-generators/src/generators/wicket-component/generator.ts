/** @author Jeff Rose */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface WicketComponentGeneratorSchema {
    name: string;
    type?: 'component' | 'container' | 'panel' | 'page';
}

const BASE_CLASS_MAP: Record<string, { className: string; importPath: string; hasTemplate: boolean }> = {
    component: { className: 'WicketComponent', importPath: 'component', hasTemplate: false },
    container: { className: 'WicketContainer', importPath: 'container', hasTemplate: true },
    panel: { className: 'Panel', importPath: 'panel', hasTemplate: true },
    page: { className: 'Page', importPath: 'page', hasTemplate: true },
};

function toPascalCase(str: string): string {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export default async function wicketComponentGenerator(
    tree: Tree,
    schema: WicketComponentGeneratorSchema
): Promise<void> {
    const { name, type = 'panel' } = schema;
    const className = toPascalCase(name);
    const base = BASE_CLASS_MAP[type];
    const projectRoot = 'packages/blue-view-wicket';

    if (!tree.exists(`${projectRoot}/package.json`)) {
        throw new Error('Package not found: packages/blue-view-wicket');
    }

    generateFiles(tree, join(__dirname, 'files'), projectRoot, {
        fileName: name,
        className,
        baseClass: base.className,
        baseImport: base.importPath,
        hasTemplate: base.hasTemplate,
        tmpl: '',
    });

    await formatFiles(tree);
}
