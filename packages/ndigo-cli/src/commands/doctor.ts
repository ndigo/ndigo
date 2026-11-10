/**
 * `ndigo doctor` — environment and framework self-diagnostics.
 */
import { buildCommand } from '@stricli/core';
import { collectDiagnostics, runDiagnostics } from './_diagnostics.js';
import { jsonFlag, writeJson } from './_json.js';

/**
 * The environment self-diagnostics command.
 */
export const doctorCommand = buildCommand({
    async func(flags: { json?: boolean }) {
        if (flags.json === true) {
            const report = await collectDiagnostics();
            const exitCode = report.failures.length === 0 ? 0 : 1;
            writeJson({ ok: exitCode === 0, exitCode, rows: report.rows, failures: report.failures });
            process.exitCode = exitCode;
            return;
        }
        process.exitCode = await runDiagnostics();
    },
    parameters: { flags: { json: jsonFlag }, positional: { kind: 'tuple', parameters: [] } },
    docs: { brief: 'Prints the framework-environment diagnostics (issue-report starter)' },
});
