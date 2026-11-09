/**
 * `ndigo ui mcp` — run the registry as a stdio MCP server.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { startRegistryServer } from '../../ui/mcp-server.js';

interface McpFlags {
    dir?: string;
    registry?: string;
    readOnly?: boolean;
}

/**
 * The MCP server command.
 */
export const mcpUiCommand = buildCommand({
    async func(flags: McpFlags) {
        await startRegistryServer({
            dir: resolveAppDir(flags.dir ?? '.'),
            ...(flags.registry === undefined ? {} : { registry: flags.registry }),
            readOnly: flags.readOnly === true,
        });
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
                brief: 'Registry file, directory, or URL (default: ndigo.ui.json, then the ndigo.dev registry).',
                optional: true,
            },
            readOnly: {
                kind: 'boolean',
                brief: 'Expose discovery tools only (omit install_items).',
                optional: true,
            },
        },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'Run the ndigo-ui MCP server over stdio' },
});
