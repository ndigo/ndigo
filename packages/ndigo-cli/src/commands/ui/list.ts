/**
 * `ndigo ui list` — print the items in a registry.
 */
import { buildCommand } from '@stricli/core';
import { usageError } from '../../helpers/app-scripts.js';
import { resolveRegistrySource } from '../../ui/config.js';
import { loadRegistry, validateRegistry } from '../../ui/registry.js';

/**
 * The registry listing command.
 */
export const listUiCommand = buildCommand({
    async func(flags: { registry?: string; json?: boolean }) {
        const source = resolveRegistrySource(process.cwd(), flags.registry);
        const registry = await loadRegistry(source);
        const errors = validateRegistry(registry);
        if (errors.length > 0) throw usageError(`registry validation failed:\n  ${errors.join('\n  ')}`);

        if (flags.json === true) {
            process.stdout.write(`${JSON.stringify(registry.items, null, 2)}\n`);
            return;
        }
        for (const item of [...registry.items].sort((left, right) => left.name.localeCompare(right.name))) {
            process.stdout.write(`${item.name}\t${item.type}\t${item.title ?? ''}\n`);
        }
    },
    parameters: {
        flags: {
            registry: {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Registry file, directory, or URL (default: config, then the ndigo.dev registry).',
                optional: true,
            },
            json: { kind: 'boolean', brief: 'Print the raw item JSON.', optional: true },
        },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'List registry items' },
});
