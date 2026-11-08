/**
 * `ndigo ui init` — write `ndigo.ui.json` with registry and alias defaults.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { DEFAULT_ALIASES, DEFAULT_REGISTRY_SOURCE, writeUiConfig } from '../../ui/config.js';
import { appDirPositional } from '../_script-fronts.js';

/**
 * The UI configuration command.
 */
export const initUiCommand = buildCommand({
    async func(flags: { registry?: string; force?: boolean }, dir: string) {
        const appDir = resolveAppDir(dir);
        const path = writeUiConfig(
            appDir,
            { registry: flags.registry ?? DEFAULT_REGISTRY_SOURCE, aliases: DEFAULT_ALIASES },
            flags.force === true
        );
        process.stdout.write(`Wrote ${path}\n`);
    },
    parameters: {
        flags: {
            registry: {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Registry file, directory, or URL (default: the GitHub repository registry).',
                optional: true,
            },
            force: { kind: 'boolean', brief: 'Overwrite an existing ndigo.ui.json.', optional: true },
        },
        positional: { kind: 'tuple', parameters: [appDirPositional] },
    },
    docs: { brief: 'Write ndigo.ui.json with registry and alias defaults' },
});
