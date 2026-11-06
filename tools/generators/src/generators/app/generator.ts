/**
 * App generator (AD-85): scaffolds an example application under
 * `apps/NN-ndigo-<slug>` — the in-repo counterpart of the future
 * `create-ndigo-app` flow. Templates are extracted from the minimal
 * reference apps (`01-ndigo-hello` for the browser kind,
 * `02-ndigo-hello-node` for the node kind); the generated manifest is a
 * private app and obeys the manifest gate's app rules
 * (`scripts/check-manifests.mjs` rule 10).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { toPascal } from '@ndigo/util/string';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateKebabName } from '../../_validators.ts';
import { collectDevPorts, nextFreePort } from './_ports.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** One of the scaffoldable application kinds. */
export type AppKind = 'browser' | 'node';

/** The application kinds the generator scaffolds. */
const APP_KINDS: readonly AppKind[] = ['browser', 'node'];

/**
 * Options for the `app` generator: the slug, the scaffold kind (`browser`
 * Vite SPA or `node` HTTP server), and optional reading-order number and dev
 * port. Allocation defaults to the first free slot, and explicit values that
 * collide fail the run.
 */
export interface AppGeneratorSchema {
    /** App slug (kebab-case, without the `ndigo-` prefix). */
    name: string;
    /** Starter preset (api, browser, full-stack, minimal). */
    preset?: string;
    /** `browser` (Vite SPA) or `node` (HTTP server) scaffold. */
    kind?: AppKind;
    /** One-line description used in the manifest and README. */
    description?: string;
    /** Reading-order number (defaults to one past the highest existing app). */
    number?: number;
    /** Dev port (defaults to the first free multiple-of-ten slot above 3000). */
    port?: number;
}

/**
 * Scaffolds the app: number and port allocation first (failing loud on the
 * explicit-value collisions), then the kind's template tree.
 */
export default async function appGenerator(tree: Tree, schema: AppGeneratorSchema): Promise<void> {
    const preset = schema.preset ?? 'minimal';
    const kind: AppKind =
        schema.kind ?? (preset === 'browser' ? 'browser' : 'node');
    const { name, description } = schema;
    validateKebabName(name, 'App name');
    if (!(APP_KINDS as readonly string[]).includes(kind)) {
        throw new Error(`App kind must be one of ${APP_KINDS.join(', ')}: "${String(kind)}"`);
    }

    const number = schema.number ?? nextAppNumber(tree);
    const ordinal = String(number).padStart(2, '0');
    const dirName = `${ordinal}-ndigo-${name}`;
    const appDir = `apps/${dirName}`;
    if (tree.exists(appDir)) {
        throw new Error(`App already exists: ${appDir}`);
    }
    if (schema.number !== undefined) {
        assertFreeNumber(tree, ordinal);
    }

    const ports = collectDevPorts(tree);
    if (schema.port !== undefined) {
        const owner = ports.get(schema.port);
        if (owner !== undefined) {
            throw new Error(`Port ${schema.port} is already used by ${owner}`);
        }
    }
    const port = schema.port ?? nextFreePort(ports);

    const className = toPascal(name);
    const camelName = className.charAt(0).toLowerCase() + className.slice(1);
    const resolvedDescription = description || `${className} — Ndigo demo application`;

    generateFiles(tree, join(__dirname, 'files', kind), appDir, {
        name,
        className,
        camelName,
        upperName: name.toUpperCase(),
        entryMethod: `${camelName}Controller`,
        description: resolvedDescription,
        dirName,
        port,
        tmpl: '',
    });

    await formatFiles(tree);
}

/**
 * The next free reading-order number: one past the highest `apps/NN-*`
 * directory (the ladder appends, it never renumbers).
 *
 * @param tree - The Nx tree the generator runs against.
 * @returns The next number.
 */
function nextAppNumber(tree: Tree): number {
    let highest = 0;
    if (tree.exists('apps')) {
        for (const entry of tree.children('apps')) {
            const match = /^(\d+)-/u.exec(entry);
            if (match !== null) {
                highest = Math.max(highest, Number(match[1]));
            }
        }
    }
    return highest + 1;
}

/**
 * Fails when an explicit reading-order number is already taken by another
 * app directory.
 *
 * @param tree - The Nx tree the generator runs against.
 * @param ordinal - The two-digit-padded number to check.
 */
function assertFreeNumber(tree: Tree, ordinal: string): void {
    if (!tree.exists('apps')) {
        return;
    }
    const taken = tree.children('apps').find((entry) => entry.startsWith(`${ordinal}-`));
    if (taken !== undefined) {
        throw new Error(`Reading-order number ${ordinal} is already used by apps/${taken}`);
    }
}
