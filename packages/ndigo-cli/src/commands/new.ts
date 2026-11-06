/**
 * `ndigo new <name>` — scaffold an example application in the workspace
 * (`apps/NN-ndigo-<name>`) through the framework-owned `app` generator
 * (AD-85). The CLI is a thin front: flags reach `@ndigo/generators:app` via
 * the workspace's Nx bridge (AD-75 D-3); the generator owns the templates,
 * the reading-order number, and the dev-port allocation.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand, numberParser } from '@stricli/core';
import { runWorkspaceOnce } from '../helpers/app-scripts.js';

/** The flags `ndigo new` forwards to the `app` generator's schema. */
export interface NewAppFlags {
    kind?: 'browser' | 'node';
    number?: number;
    port?: number;
    description?: string;
    dryRun?: boolean;
}

/**
 * Builds the generator argv for `ndigo new` from the parsed flags — the
 * unit-testable seam. Only flags the `app` schema declares are forwarded;
 * `--name` is always present, and `--dry-run` previews the file plan
 * without writing anything.
 *
 * @param name - The app slug (kebab-case).
 * @param flags - The parsed flags.
 * @returns The argv appended to `exec nx g @ndigo/generators:app`.
 */
export function newAppArgv(name: string, flags: NewAppFlags): string[] {
    const argv = ['--name', name];
    if (flags.kind !== undefined) {
        argv.push('--kind', flags.kind);
    }
    if (flags.number !== undefined) {
        argv.push('--number', String(flags.number));
    }
    if (flags.port !== undefined) {
        argv.push('--port', String(flags.port));
    }
    if (flags.description !== undefined) {
        argv.push('--description', flags.description);
    }
    if (flags.dryRun) {
        argv.push('--dry-run');
    }
    return argv;
}

/**
 * The scaffold command (`ndigo new`).
 */
export const newCommand = buildCommand({
    async func(flags: NewAppFlags, name: string) {
        process.exitCode = await runWorkspaceOnce([
            'exec',
            'nx',
            'g',
            '@ndigo/generators:app',
            ...newAppArgv(name, {
                kind: flags.kind,
                number: flags.number,
                port: flags.port,
                description: flags.description,
                dryRun: flags.dryRun,
            }),
        ]);
    },
    parameters: {
        flags: {
            kind: {
                kind: 'enum',
                values: ['browser', 'node'],
                brief: 'Application kind.',
                optional: true,
            },
            number: {
                kind: 'parsed',
                parse: numberParser,
                brief: 'Reading-order number (defaults to the next free).',
                optional: true,
            },
            port: {
                kind: 'parsed',
                parse: numberParser,
                brief: 'Dev port (defaults to the first free multiple-of-ten slot).',
                optional: true,
            },
            description: {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'One-line description used in the manifest and README.',
                optional: true,
            },
            dryRun: {
                kind: 'boolean',
                brief: 'Preview the generated files without writing them.',
                optional: true,
            },
        },
        positional: { kind: 'tuple', parameters: [
            {
                parse: (value: string) => value,
                brief: 'App slug (kebab-case, without the ndigo- prefix)',
                placeholder: 'name',
            },
        ] },
    },
    docs: {
        brief: 'Scaffold an example application under apps/ (ndigo new <name>)',
        fullDescription:
            'Adds an application to this repository\'s apps/ ladder through the ' +
            'framework-owned app generator (@ndigo/generators:app). The reading-order number ' +
            'and dev port are allocated automatically (the port scan covers the ladder\'s ' +
            'documented conventions); pass --number/--port to override, --dry-run to ' +
            'preview the file plan without writing.',
    },
});