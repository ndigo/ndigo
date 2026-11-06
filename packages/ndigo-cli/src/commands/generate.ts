/**
 * `ndigo generate` — front the framework-owned generators
 * (`@ndigo/generators`): package, component, readme, header. The CLI is a
 * thin, prompting front over the workspace's Nx bridge — the generator
 * implementations stay in their package (AD-75 D-3).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runWorkspaceOnce, usageError } from '../helpers/app-scripts.js';

/** The generator kinds `@ndigo/generators` exposes (checked at run time). */
const GENERATOR_KINDS = [
    'package',
    'component',
    'readme',
    'header',
    'controller',
    'service',
    'entity',
    'middleware',
    'config',
    'migration',
] as const;

/**
 * The flags each generator's schema accepts. The CLI exposes the full
 * surface (BLK-3): `ndigo generate component --name x --package y` (and
 * `ndigo generate header --file z`) must reach Nx — forwarding only `--name`
 * left component/header un-runnable when their required fields were missing.
 */
export interface GenerateFlags {
    name?: string;
    package?: string;
    file?: string;
    force?: boolean;
    className?: string;
    summary?: string;
    author?: string;
    description?: string;
    module?: string;
    path?: string;
    jobs?: boolean;
}

/**
 * The schema-accepted flag names per generator kind. Nx validates generator
 * options against the kind's schema and rejects unknown ones, so the CLI
 * must not forward a flag a kind does not declare (BLK-3): `--file` to
 * `package`, for example, would fail the nx run.
 */
const FLAG_KEYS_BY_KIND: Record<string, readonly string[]> = {
    package: ['name', 'description', 'jobs'],
    component: ['name', 'package', 'className', 'summary', 'author'],
    readme: ['name', 'description', 'path'],
    header: ['file', 'module', 'summary', 'author', 'force'],
    controller: ['name', 'package', 'className', 'summary', 'author'],
    service: ['name', 'package', 'className', 'summary', 'author'],
    entity: ['name', 'package', 'className', 'summary', 'author'],
    middleware: ['name', 'package', 'className', 'summary', 'author'],
    config: ['name', 'package', 'className', 'summary', 'author'],
    migration: ['name', 'package', 'className', 'summary', 'author'],
};

/**
 * Builds the nx argv for a generator kind from the parsed flags — the
 * unit-testable seam (BLK-3). Only flags the kind's schema declares are
 * forwarded; boolean flags become a bare `--flag`.
 *
 * @param kind - The generator kind.
 * @param flags - The parsed flags.
 * @returns The argv appended to `exec nx g @ndigo/generators:<kind>`.
 */
export function generateArgv(kind: string, flags: GenerateFlags): string[] {
    const argv: string[] = [];
    for (const key of FLAG_KEYS_BY_KIND[kind] ?? []) {
        const value = flags[key as keyof GenerateFlags];
        if (value === undefined) {
            continue;
        }
        if (typeof value === 'boolean') {
            if (value) {
                argv.push(`--${key}`);
            }
            continue;
        }
        argv.push(`--${key}`, String(value));
    }
    return argv;
}

/**
 * The generator front command (`ndigo g` alias).
 */
export const generateCommand = buildCommand({
    async func(flags: GenerateFlags, kind: string, dir: string) {
        const resolved = resolveAppDir(dir);
        if (!(GENERATOR_KINDS as readonly string[]).includes(kind)) {
            const hint = kind === 'app' ? "; to scaffold an application, run 'ndigo new <name>'" : '';
            throw usageError(`unknown generator '${kind}' — one of ${GENERATOR_KINDS.join(', ')}${hint}`);
        }
        const argv = [
            'exec',
            'nx',
            'g',
            `@ndigo/generators:${kind}`,
            ...generateArgv(kind, {
                name: flags.name,
                package: flags.package,
                file: flags.file,
                force: flags.force,
                className: flags.className,
                summary: flags.summary,
                author: flags.author,
                description: flags.description,
                module: flags.module,
                path: flags.path,
                jobs: flags.jobs,
            }),
        ];
        process.exitCode = await runWorkspaceOnce(argv, resolved);
    },
    parameters: {
        flags: {
            name: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Artifact name (package/component/readme; prompted when omitted).',
                optional: true,
            },
            package: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Target package (component; required — prompted when omitted).',
                optional: true,
            },
            file: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Header target file (header; required — prompted when omitted).',
                optional: true,
            },
            force: { kind: 'boolean', brief: 'Overwrite an existing header (header).', optional: true },
            className: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Generated class name (component).',
                optional: true,
            },
            summary: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'One-line summary (component/header).',
                optional: true,
            },
            author: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Author line (component/header).',
                optional: true,
            },
            description: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Package description (package/readme; prompted when omitted).',
                optional: true,
            },
            module: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Documented module name for the header block (header).',
                optional: true,
            },
            path: { kind: 'parsed', parse: (v: string) => v, brief: 'README target path (readme).', optional: true },
            jobs: {
                kind: 'boolean',
                brief: 'Wire the @ndigo/jobs dependency into a new package (package).',
                optional: true,
            },
        },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: `One of: ${GENERATOR_KINDS.join(', ')}`,
                    placeholder: 'kind',
                },
                {
                    parse: (value: string) => value,
                    brief: 'Workspace/app directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: {
        brief: 'Generate framework artifacts through @ndigo/generators',
        fullDescription:
            'Generates an artifact (package, component, readme, header) via the ' +
            "workspace's generator package. The CLI resolves the workspace from the " +
            'directory argument and runs the generator there — the generator ' +
            'implementations themselves live in @ndigo/generators (AD-75 D-3).',
    },
});
