/**
 * `ndigo ui view` — print one registry item.
 */
import { buildCommand } from '@stricli/core';
import { usageError } from '../../helpers/app-scripts.js';
import { resolveRegistrySource } from '../../ui/config.js';
import { loadRegistry } from '../../ui/registry.js';

/**
 * The item inspection command.
 */
export const viewUiCommand = buildCommand({
    async func(flags: { registry?: string; json?: boolean }, name: string) {
        const source = resolveRegistrySource(process.cwd(), flags.registry);
        const registry = await loadRegistry(source);
        const item = registry.items.find((candidate) => candidate.name === name);
        if (item === undefined) throw usageError(`unknown registry item '${name}'`);

        if (flags.json === true) {
            process.stdout.write(`${JSON.stringify(item, null, 2)}\n`);
            return;
        }
        process.stdout.write(`${item.name} (${item.type})\n`);
        if (item.title !== undefined) process.stdout.write(`  ${item.title}\n`);
        if (item.description !== undefined) process.stdout.write(`  ${item.description}\n`);
        if (item.dependencies !== undefined && item.dependencies.length > 0) {
            process.stdout.write(`  dependencies: ${item.dependencies.join(', ')}\n`);
        }
        if (item.registryDependencies !== undefined && item.registryDependencies.length > 0) {
            process.stdout.write(`  registry: ${item.registryDependencies.join(', ')}\n`);
        }
        for (const file of item.files ?? []) {
            process.stdout.write(`  ${file.path}${file.target === undefined ? '' : ` → ${file.target}`}\n`);
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
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Registry item name.',
                    placeholder: 'item',
                },
            ],
        },
    },
    docs: { brief: 'Show one registry item' },
});
