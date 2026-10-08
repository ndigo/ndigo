/**
 * `blue inspect` — run the application's declared `inspect` script (the
 * AD-70 introspection entry prints the app manifest without binding a
 * port). The introspection logic stays in `@blue/inspect`; the app owns
 * the wiring (AD-75 D-3, AD-70).
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args } from '@oclif/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

/**
 * The application-manifest inspection command.
 */
export class InspectCommand extends Command {
    static summary = 'Print the application manifest (routes, mappings, config keys)';
    static description =
        "Runs the app's scripts.inspect — the AD-70 introspection entry " +
        'that builds the manifest without listening. The wiring lives in ' +
        'the app (choose its controllers/config classes); @blue/inspect owns ' +
        'the introspection.';

    static examples = ['$ blue inspect', '$ blue inspect ./apps/04-blue-api'];

    static args = {
        dir: Args.string({
            summary: 'Application directory (default: current directory).',
            default: '.',
        }),
    };

    async run(): Promise<void> {
        const { args } = await this.parse();
        const dir = resolveAppDir(args.dir);
        process.exitCode = await runAppOnce(
            dir,
            'inspect',
            'add an "inspect" script that builds and prints the manifest, e.g. "inspect": "tsx src/inspect.ts" (AD-70)'
        );
    }
}
