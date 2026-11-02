/**
 * `blue new <name>` — scaffold an example application in the workspace
 * (`apps/NN-blue-<name>`) through the framework-owned `app` generator
 * (AD-85). The CLI is a thin front: flags reach `@blue/generators:app` via
 * the workspace's Nx bridge (AD-75 D-3); the generator owns the templates,
 * the reading-order number, and the dev-port allocation.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args, Flags } from '@oclif/core';
import { runWorkspaceOnce } from '../helpers/app-scripts.js';

/** The flags `blue new` forwards to the `app` generator's schema. */
export interface NewAppFlags {
    kind?: 'browser' | 'node';
    number?: number;
    port?: number;
    description?: string;
    dryRun?: boolean;
}

/**
 * Builds the generator argv for `blue new` from the parsed flags — the
 * unit-testable seam. Only flags the `app` schema declares are forwarded;
 * `--name` is always present, and `--dry-run` previews the file plan
 * without writing anything.
 *
 * @param name - The app slug (kebab-case).
 * @param flags - The parsed flags.
 * @returns The argv appended to `exec nx g @blue/generators:app`.
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
 * The scaffold command (`blue new`).
 */
export class NewCommand extends Command {
    static summary = 'Scaffold an example application under apps/ (blue new <name>)';
    static description = `Adds an application to this repository's apps/ ladder through the
framework-owned app generator (@blue/generators:app). The reading-order number
and dev port are allocated automatically (the port scan covers the ladder's
documented conventions); pass --number/--port to override, --dry-run to
preview the file plan without writing.`;

    static examples = [
        '$ blue new todo-widget --kind node',
        '$ blue new todo-widget --kind browser --description "Widget demo"',
        '$ blue new todo-widget --kind node --port 3190 --dry-run',
    ];

    static flags = {
        kind: Flags.string({
            summary: 'Application kind.',
            options: ['browser', 'node'],
        }),
        number: Flags.integer({
            summary: 'Reading-order number (defaults to the next free).',
            min: 1,
        }),
        port: Flags.integer({
            summary: 'Dev port (defaults to the first free multiple-of-ten slot).',
            min: 1,
            max: 65_535,
        }),
        description: Flags.string({
            summary: 'One-line description used in the manifest and README.',
        }),
        dryRun: Flags.boolean({
            summary: 'Preview the generated files without writing them.',
            default: false,
        }),
    };

    static args = {
        name: Args.string({
            summary: 'App slug (kebab-case, without the blue- prefix)',
            required: true,
        }),
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse();
        process.exitCode = await runWorkspaceOnce([
            'exec',
            'nx',
            'g',
            '@blue/generators:app',
            ...newAppArgv(args.name, {
                kind: flags.kind as NewAppFlags['kind'],
                number: flags.number,
                port: flags.port,
                description: flags.description,
                dryRun: flags.dryRun,
            }),
        ]);
    }
}
