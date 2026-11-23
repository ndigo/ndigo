/**
 * `ndigo add <capability>` — plan or apply a catalog capability into an
 * application. The plan is the default; `--apply` performs it.
 */
import { buildCommand } from '@stricli/core';
import {
    appNameOf,
    applyCapability,
    planCapability,
    resolveCapability,
    resolveCapabilityVariables,
} from '../capabilities/apply.js';
import type { CapabilityApplyResult, CapabilityExecution } from '../capabilities/apply.js';
import { loadCatalog } from '../capabilities/catalog.js';
import { loadCatalogReferences, validateCatalog } from '../capabilities/validate.js';
import { readAppManifest, resolveAppDir, usageError } from '../helpers/app-scripts.js';
import { jsonFlag, writeJson } from './_output.js';

/** Flags shared by the plan and apply halves. */
interface AddFlags {
    readonly apply?: boolean;
    readonly json?: boolean;
    readonly force?: boolean;
    readonly skipInstall?: boolean;
    readonly var?: readonly string[];
}

/**
 * The capability add command.
 */
export const addCommand = buildCommand({
    async func(flags: AddFlags, target: string, dir: string) {
        const resolved = resolveAppDir(dir);
        const capabilities = validatedCapabilities();
        const capability = resolveCapability(target, capabilities);
        const variables = resolveCapabilityVariables(capability, flags.var, appNameOf(readAppManifest(resolved)));
        const execution = planCapability(capability, {
            dir: resolved,
            mode: flags.apply === true ? 'apply' : 'plan',
            variables,
            force: flags.force === true,
        });

        if (flags.apply !== true) {
            if (flags.json === true) writeJson(planDocument(execution));
            else printPlan(execution);
            return;
        }
        if (execution.plan.conflicts.length > 0) {
            for (const conflict of execution.plan.conflicts) process.stderr.write(`✗ ${conflict}\n`);
            if (flags.json === true) writeJson({ ...planDocument(execution), applied: false });
            process.exitCode = 1;
            return;
        }

        let result: CapabilityApplyResult;
        try {
            result = await applyCapability(execution, {
                dir: resolved,
                skipInstall: flags.skipInstall === true,
                dependencyStdio: flags.json === true ? 'stderr' : 'inherit',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (flags.json === true) writeJson({ ...planDocument(execution), applied: false, error: message });
            else process.stderr.write(`✗ ${message}\n`);
            process.exitCode = 1;
            return;
        }

        if (flags.json === true) writeJson({ ...planDocument(execution), ...applyDocument(result) });
        else printApply(execution, result);
    },
    parameters: {
        flags: {
            apply: {
                kind: 'boolean',
                brief: 'Write the files, JSON edits, and dependencies (default: plan only).',
                optional: true,
            },
            json: jsonFlag,
            force: {
                kind: 'boolean',
                brief: 'Overwrite files or JSON values that differ from the catalog.',
                optional: true,
            },
            skipInstall: {
                kind: 'boolean',
                brief: 'Report missing dependencies without running the package manager.',
                optional: true,
            },
            var: {
                kind: 'parsed',
                parse: (value: string) => value,
                variadic: true,
                optional: true,
                brief: 'Template variable as name=value (repeatable).',
            },
        },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Capability id or @ndigo/* package name.',
                    placeholder: 'capability',
                },
                {
                    parse: (value: string) => value,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: { brief: 'Plan or apply a capability into an app' },
});

function validatedCapabilities() {
    const catalog = loadCatalog();
    const loaded = loadCatalogReferences();
    const errors = [...loaded.errors, ...validateCatalog(catalog, loaded.references)];
    if (errors.length > 0) throw usageError(`capability catalog is invalid:\n  ${errors.join('\n  ')}`);
    return catalog.capabilities;
}

function planDocument(execution: CapabilityExecution) {
    const { plan } = execution;
    return {
        capability: plan.capability,
        mode: plan.mode,
        steps: plan.steps,
        conflicts: plan.conflicts,
        writes: plan.writes,
        dependencies: plan.dependencies,
        variables: plan.variables,
    };
}

function applyDocument(result: CapabilityApplyResult) {
    return {
        applied: result.written.length + result.edited.length + result.installed.length > 0,
        written: result.written,
        edited: result.edited,
        installed: result.installed,
        skipped: result.skipped,
    };
}

function printPlan(execution: CapabilityExecution): void {
    const { plan } = execution;
    process.stdout.write(`${plan.capability} (${plan.mode})\n`);
    for (const step of plan.steps) {
        process.stdout.write(`  ${step.op} ${step.target} — ${step.status}\n`);
    }
    for (const conflict of plan.conflicts) process.stderr.write(`✗ ${conflict}\n`);
    if (plan.conflicts.length === 0) {
        const pending = plan.steps.filter((step) => step.status === 'pending').length;
        if (pending > 0) process.stdout.write(`\nApply with \`ndigo add ${plan.capability} --apply\`.\n`);
    }
}

function printApply(execution: CapabilityExecution, result: CapabilityApplyResult): void {
    const { plan } = execution;
    const lines: string[] = [];
    for (const written of result.written) lines.push(`wrote ${written}`);
    for (const edited of result.edited) lines.push(`updated ${edited}`);
    for (const installed of result.installed) lines.push(`installed ${installed}`);
    for (const skipped of result.skipped) lines.push(`skipped ${skipped} (--skipInstall)`);
    if (lines.length === 0) {
        process.stdout.write(`${plan.capability}: nothing to do\n`);
        return;
    }
    process.stdout.write(`${plan.capability} (applied)\n`);
    for (const line of lines) process.stdout.write(`  ${line}\n`);
}
