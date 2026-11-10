/**
 * `ndigo ui catalog` — emit the A2UI catalog for the installed registry items.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { getCatalog } from '../../ui/mcp-tools.js';

/**
 * The A2UI catalog command.
 */
export const catalogUiCommand = buildCommand({
    async func(flags: { dir?: string; registry?: string; json?: boolean }) {
        const dir = resolveAppDir(flags.dir ?? '.');
        const context = flags.registry === undefined ? { dir } : { dir, registry: flags.registry };
        const { source, catalog } = await getCatalog(context);

        if (flags.json === true) {
            process.stdout.write(`${JSON.stringify(catalog, null, 2)}\n`);
            return;
        }
        process.stdout.write(
            `catalog ${catalog.catalogId} (${Object.keys(catalog.components).length} components) from ${source}\n`
        );
        for (const [name, descriptor] of Object.entries(catalog.components)) {
            process.stdout.write(`${name}\t${descriptor['x-ndigo-item']}\t${descriptor.description}\n`);
        }
    },
    parameters: {
        flags: {
            dir: {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Application directory (default: current directory).',
                optional: true,
            },
            registry: {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Registry file, directory, or URL (default: ndigo.ui.json, then the ndigo.dev registry).',
                optional: true,
            },
            json: { kind: 'boolean', brief: 'Print the A2UI catalog JSON.', optional: true },
        },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'Emit the A2UI component catalog for installed registry items' },
});
