/**
 * `ndigo ui list` — print the items in a registry.
 */
import { buildCommand } from '@stricli/core';
import { compareBy, stringComparator } from '@ndigo/core';
import { usageError } from '../../helpers/app-scripts.js';
import { jsonFlag, pickFormat, writeJson } from '../_output.js';
import { resolveRegistrySource } from '../../ui/config.js';
import { loadRegistry, validateRegistry } from '../../ui/registry.js';

/**
 * The registry listing command.
 */
export const listUiCommand = buildCommand({
    async func(flags: { registry?: string; json?: boolean }) {
        const format = pickFormat(flags);
        const source = resolveRegistrySource(process.cwd(), flags.registry);
        const registry = await loadRegistry(source);
        const errors = validateRegistry(registry);
        if (errors.length > 0) throw usageError(`registry validation failed:\n  ${errors.join('\n  ')}`);

        // JSON only — the registry items' heterogeneous shape measured below
        // the keep-threshold (issue #349: −21% vs pretty, −0% vs minified),
        // so the verb keeps its single canonical machine contract.
        if (format === 'json') {
            writeJson(registry.items);
            return;
        }
        for (const item of [...registry.items].sort(compareBy((entry) => entry.name, stringComparator.compare))) {
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
            json: jsonFlag,
        },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'List registry items' },
});
