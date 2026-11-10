/**
 * `ndigo mcp` — run an MCP server over stdio with the application's
 * introspection tools, or delegate to the application's own server.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir } from '../helpers/app-scripts.js';
import { startAppServer } from '../mcp/server.js';
import { appDirPositional } from './_script-fronts.js';

interface McpFlags {
    readOnly?: boolean;
    live?: boolean;
}

/**
 * The application MCP server command.
 */
export const mcpCommand = buildCommand({
    async func(flags: McpFlags, dir: string) {
        await startAppServer({
            dir: resolveAppDir(dir),
            readOnly: flags.readOnly === true,
            live: flags.live === true,
        });
    },
    parameters: {
        flags: {
            readOnly: {
                kind: 'boolean',
                brief: 'Expose read-only tools only (omit run_target and record_rule).',
                optional: true,
            },
            live: {
                kind: 'boolean',
                brief: "Delegate to the application's scripts.mcp instead of the static tool set.",
                optional: true,
            },
        },
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Run an MCP server over stdio (application introspection tools)' },
});
