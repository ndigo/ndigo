/**
 * `ndigo commands` — the command index: every verb, its flags, positionals,
 * brief, and exit codes; `--json` is the machine-readable form.
 */
import { buildCommand } from '@stricli/core';
import { requireCommandIndex } from './_command-registry.js';
import { jsonFlag, writeJson } from './_json.js';

/**
 * The command-index command.
 */
export const commandsCommand = buildCommand({
    async func(flags: { json?: boolean }) {
        const index = requireCommandIndex();
        if (flags.json === true) {
            writeJson(index);
            return;
        }
        for (const entry of index.commands) {
            process.stdout.write(`ndigo ${entry.command}  ${entry.brief}\n`);
        }
    },
    parameters: {
        flags: { json: jsonFlag },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'List every command with its parameters (--json for the full index)' },
});
