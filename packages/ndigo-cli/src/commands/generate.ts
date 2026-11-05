/**
 * `ndigo generate` — front the framework-owned generators
 * (`@ndigo/generators`): package, component, readme, header. The CLI is a
 * thin, prompting front over the workspace's Nx bridge — the generator
 * implementations stay in their package (AD-75 D-3).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args, Flags } from '@oclif/core';
import { resolveAppDir, runWorkspaceOnce, usageError } from '../helpers/app-scripts.js';

/** The generator kinds `@ndigo/generators` exposes (checked at run time). */
const GENERATOR_KINDS = ['package', 'component', 'readme', 'header'] as const;

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
export class GenerateCommand extends Command {
    static summary = 'Generate framework artifacts through @ndigo/generators';
    static description = `Generates an artifact (package, component, readme, header) via the
workspace's generator package. The CLI resolves the workspace from the
directory argument and runs the generator there — the generator
implementations themselves live in @ndigo/generators (AD-75 D-3).`;

    static examples = [
        '$ ndigo generate package --name my-app',
        '$ ndigo generate header --file packages/my-app/src/index.ts',
        '$ ndigo generate component --name widget-button --package my-app',
        '$ ndigo g package --name my-app --description "A demo package"',
    ];

    static flags = {
        name: Flags.string({
            summary: 'Artifact name (package/component/readme; prompted when omitted).',
            default: undefined,
        }),
        package: Flags.string({
            summary: 'Target package (component; required — prompted when omitted).',
            default: undefined,
        }),
        file: Flags.string({
            summary: 'Header target file (header; required — prompted when omitted).',
            default: undefined,
        }),
        force: Flags.boolean({
            summary: 'Overwrite an existing header (header).',
            default: false,
        }),
        className: Flags.string({
            summary: 'Generated class name (component).',
            default: undefined,
        }),
        summary: Flags.string({
            summary: 'One-line summary (component/header).',
            default: undefined,
        }),
        author: Flags.string({
            summary: 'Author line (component/header).',
            default: undefined,
        }),
        description: Flags.string({
            summary: 'Package description (package/readme; prompted when omitted).',
            default: undefined,
        }),
        module: Flags.string({
            summary: 'Documented module name for the header block (header).',
            default: undefined,
        }),
        path: Flags.string({
            summary: 'README target path (readme).',
            default: undefined,
        }),
        jobs: Flags.boolean({
            summary: 'Wire the @ndigo/jobs dependency into a new package (package).',
            default: false,
        }),
    };

    static args = {
        kind: Args.string({
            summary: `One of: ${GENERATOR_KINDS.join(', ')}`,
            required: true,
        }),
        dir: Args.string({
            summary: 'Workspace/app directory (default: current directory).',
            default: '.',
        }),
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse();
        const dir = resolveAppDir(args.dir);
        const kind = args.kind;
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
        // pnpm resolves the workspace from the directory argument (walks up
        // to the workspace root); the generator runs in that project context.
        process.exitCode = await runWorkspaceOnce(argv, dir);
    }
}
