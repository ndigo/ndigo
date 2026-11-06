/**
 * `ndigo doctor` — environment and framework self-diagnostics.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { runDiagnostics } from './_diagnostics.js';

/**
 * The environment self-diagnostics command.
 */
export const doctorCommand = buildCommand({
    async func() {
        process.exitCode = await runDiagnostics();
    },
    parameters: { flags: {}, positional: { kind: 'tuple', parameters: [] } },
    docs: { brief: 'Prints the framework-environment diagnostics (issue-report starter)' },
});
