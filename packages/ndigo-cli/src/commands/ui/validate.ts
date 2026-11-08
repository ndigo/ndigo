/**
 * `ndigo ui validate` — validate a registry's shape and local file targets.
 */
import { buildCommand } from '@stricli/core';
import { usageError } from '../../helpers/app-scripts.js';
import { resolveRegistrySource } from '../../ui/config.js';
import { loadRegistry, validateRegistry } from '../../ui/registry.js';

/**
 * The registry validation command.
 */
export const validateUiCommand = buildCommand({
    async func(flags: { registry?: string }) {
        const source = resolveRegistrySource(process.cwd(), flags.registry);
        const registry = await loadRegistry(source);
        const errors = validateRegistry(registry);
        if (errors.length > 0) throw usageError(`registry validation failed:\n  ${errors.join('\n  ')}`);
        process.stdout.write(`Registry is valid: ${String(registry.items.length)} items (${registry.source})\n`);
    },
    parameters: {
        flags: {
            registry: {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Registry file, directory, or URL (default: config, then the GitHub registry).',
                optional: true,
            },
        },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'Validate a registry' },
});
