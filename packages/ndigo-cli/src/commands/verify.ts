/**
 * `ndigo verify` — run the declared capability checks and the application's
 * verification lanes, with a machine-readable report.
 */
import { buildCommand } from '@stricli/core';
import { resolveCapability } from '../capabilities/apply.js';
import { runVerification } from '../capabilities/verify.js';
import type { VerifyReport } from '../capabilities/verify.js';
import { loadValidatedCapabilities } from '../capabilities/validate.js';
import { resolveAppDir } from '../helpers/app-scripts.js';
import { jsonFlag, writeJson } from './_output.js';

/** Flags of the verify command. */
interface VerifyFlags {
    readonly capability?: string;
    readonly full?: boolean;
    readonly json?: boolean;
}

/**
 * The verification command.
 */
export const verifyCommand = buildCommand({
    async func(flags: VerifyFlags, dir: string) {
        const resolved = resolveAppDir(dir);
        const capabilities = loadValidatedCapabilities();
        const capability =
            flags.capability === undefined ? undefined : resolveCapability(flags.capability, capabilities);
        const report = await runVerification({
            dir: resolved,
            catalog: capabilities,
            ...(capability === undefined ? {} : { capability }),
            full: flags.full === true,
        });

        if (flags.json === true) writeJson(report);
        else printReport(report);
        if (!report.ok) process.exitCode = 1;
    },
    parameters: {
        flags: {
            capability: {
                kind: 'parsed',
                parse: (value: string) => value,
                optional: true,
                brief: 'Capability id to verify (default: every catalog check).',
                placeholder: 'id',
            },
            full: {
                kind: 'boolean',
                brief: 'Also run the app typecheck, test, and lint lanes.',
                optional: true,
            },
            json: jsonFlag,
        },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: { brief: 'Run capability checks and the app verification lanes' },
});

function printReport(report: VerifyReport): void {
    const subject = report.capability === undefined ? 'all capabilities' : report.capability;
    process.stdout.write(`verify ${subject} (${report.app})\n`);
    for (const check of report.checks) {
        const mark = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '-';
        const detail = check.message === undefined ? '' : ` — ${check.message}`;
        process.stdout.write(`  ${mark} ${check.id}${detail}\n`);
    }
    process.stdout.write(
        `${report.summary.pass} passed, ${report.summary.fail} failed, ${report.summary.skip} skipped\n`
    );
}
