/**
 * `blue generate` — front the framework-owned generators
 * (`@blue/generators`): package, component, readme, header. The CLI is a
 * thin, prompting front over the workspace's Nx bridge — the generator
 * implementations stay in their package (AD-75 D-3).
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args, Flags } from '@oclif/core';
import { resolveAppDir, runWorkspaceOnce, usageError } from '../helpers/app-scripts.js';

/** The generator kinds `@blue/generators` exposes (checked at run time). */
const GENERATOR_KINDS = ['package', 'component', 'readme', 'header'] as const;

/**
 * The generator front command (`blue g` alias).
 */
export class GenerateCommand extends Command {
    static summary = 'Generate framework artifacts through @blue/generators';
    static description = `Generates an artifact (package, component, readme, header) via the
workspace's generator package. The CLI resolves the workspace from the
directory argument and runs the generator there — the generator
implementations themselves live in @blue/generators (AD-75 D-3).`;

    static examples = [
        '$ blue generate package --name my-app',
        '$ blue generate header --name myservice/components',
        '$ blue g component --name widget-button',
    ];

    static flags = {
        name: Flags.string({
            summary: 'Artifact name (prompted when omitted).',
            default: undefined,
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
            throw usageError(`unknown generator '${kind}' — one of ${GENERATOR_KINDS.join(', ')}`);
        }
        const argv = ['exec', 'nx', 'g', `@blue/generators:${kind}`];
        if (flags.name !== undefined) {
            argv.push('--name', flags.name);
        }
        // pnpm resolves the workspace from the directory argument (walks up
        // to the workspace root); the generator runs in that project context.
        process.exitCode = await runWorkspaceOnce(argv, dir);
    }
}
