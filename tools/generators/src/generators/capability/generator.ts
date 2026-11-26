/**
 * `capability` generator — scaffolds a catalog capability entry: a
 * schema-conformant `capability.json` with the dependency operation and the
 * default checks, ready for the author to add templates and checks
 * (docs/guides/capability-authoring.md).
 */
import { formatFiles, type Tree } from '@nx/devkit';
import { join } from 'node:path';

/** The catalog root the CLI ships (mirror of CAPABILITIES_DIR in source). */
const DEFAULT_CATALOG = 'packages/ndigo-cli/assets/capabilities';

/** The id pattern the catalog enforces. */
const idPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/** The package-name pattern the catalog enforces. */
const packagePattern = /^@ndigo\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/**
 * Options for the `capability` generator: the id (and directory name), the
 * one-line summary, the composing packages, and the guide the capability
 * links to.
 */
export interface CapabilityGeneratorSchema {
    id: string;
    summary: string;
    packages: string[];
    guide: string;
    /** Catalog root override (default: the CLI's shipped assets). */
    catalog?: string;
}

/**
 * Writes `packages/ndigo-cli/assets/capabilities/<id>/capability.json`. The
 * entry passes the catalog schema immediately; `ndigo capabilities check`
 * goes green once the composing packages declare the capability in their
 * `ndigo` manifest block and the facts regenerate
 * (`pnpm agent-content:build`).
 */
export default async function capabilityGenerator(tree: Tree, schema: CapabilityGeneratorSchema): Promise<void> {
    const id = schema.id;
    if (!idPattern.test(id)) throw new Error(`capability id '${id}' is not kebab-case`);
    if (!Array.isArray(schema.packages) || schema.packages.length === 0) {
        throw new Error('declare at least one composing @ndigo/* package');
    }
    for (const pkg of schema.packages) {
        if (!packagePattern.test(pkg)) throw new Error(`'${pkg}' is not an @ndigo/* package name`);
    }
    if (schema.summary.length === 0 || schema.summary.length > 160) {
        throw new Error('summary must be 1-160 characters');
    }
    if (schema.guide.length === 0) throw new Error('declare the guide slug the capability links to');

    const target = join(schema.catalog ?? DEFAULT_CATALOG, id);
    if (tree.exists(join(target, 'capability.json'))) {
        throw new Error(`capability '${id}' already exists at ${target}`);
    }

    tree.write(
        join(target, 'capability.json'),
        `${JSON.stringify(
            {
                id,
                kind: 'capability',
                summary: schema.summary,
                packages: schema.packages,
                guide: schema.guide,
                ops: [{ op: 'addDependency', packages: schema.packages }],
                checks: ['app-boot', 'typecheck'],
            },
            null,
            2
        )}\n`
    );
    await formatFiles(tree);
}
