/**
 * `ndigo ui add` — install one or more registry items (with their registry
 * dependencies) into an application, update `ui.lock.json`, and optionally
 * install the npm dependencies.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { resolveAliases, resolveRegistrySource } from '../../ui/config.js';
import { applyInstall, planInstall } from '../../ui/install.js';
import { loadRegistry, validateRegistry } from '../../ui/registry.js';
import { usageError } from '../../helpers/app-scripts.js';

interface AddFlags {
    dir?: string;
    registry?: string;
    dryRun?: boolean;
    overwrite?: boolean;
    skipInstall?: boolean;
}

/**
 * The registry install command.
 */
export const addUiCommand = buildCommand({
    async func(flags: AddFlags, ...items: string[]) {
        const dir = resolveAppDir(flags.dir ?? '.');
        const source = resolveRegistrySource(dir, flags.registry);
        const registry = await loadRegistry(source);
        const errors = validateRegistry(registry);
        if (errors.length > 0) throw usageError(`registry validation failed:\n  ${errors.join('\n  ')}`);

        const plan = await planInstall(registry, items, resolveAliases(dir));
        const result = await applyInstall(plan, {
            dir,
            dryRun: flags.dryRun === true,
            overwrite: flags.overwrite === true,
            install: flags.skipInstall !== true,
        });

        const names = plan.items.map((item) => item.name).join(', ');
        process.stdout.write(`${flags.dryRun === true ? 'Would install' : 'Installed'} ${names}\n`);
        for (const file of result.written) {
            process.stdout.write(`  ${flags.dryRun === true ? 'would write' : 'wrote'} ${file}\n`);
        }
        for (const file of result.unchanged) process.stdout.write(`  unchanged ${file}\n`);
        if (plan.dependencies.length > 0) {
            process.stdout.write(`Dependencies: ${plan.dependencies.join(', ')}\n`);
            if (flags.skipInstall === true) process.stdout.write('  skipped (--skip-install)\n');
            else if (flags.dryRun === true) process.stdout.write('  would install\n');
        }
        if (flags.dryRun !== true) process.stdout.write(`Lockfile: ${result.lockPath}\n`);
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
                brief: 'Registry file, directory, or URL (default: config, then the GitHub registry).',
                optional: true,
            },
            dryRun: { kind: 'boolean', brief: 'Report the plan without writing files or installing.', optional: true },
            overwrite: {
                kind: 'boolean',
                brief: 'Replace files that differ from the registry content.',
                optional: true,
            },
            skipInstall: { kind: 'boolean', brief: 'Write files but do not install npm dependencies.', optional: true },
        },
        positional: {
            kind: 'array',
            parameter: {
                parse: (value: string) => value,
                brief: 'Registry item(s) to install.',
                placeholder: 'item',
            },
            minimum: 1,
        },
    },
    docs: { brief: 'Install registry items into an application' },
});
