/**
 * The `ndigo mcp` stdio server: static application introspection tools, plus
 * a live mode that delegates to the application's own `scripts.mcp` (AD-70).
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { appScriptCommand, runInteractiveSpawn } from '../helpers/app-scripts.js';
import { createMcpHost } from '../helpers/mcp-host.js';
import type { McpHost } from '../helpers/mcp-host.js';
import {
    createAppToolContext,
    getBestPractices,
    getConfigKeys,
    getDiagnostics,
    getLogs,
    getManifest,
    getRoutes,
    recordRule,
    runTarget,
} from './tools.js';

/** Options for {@link createAppServer}. */
export interface AppServerOptions {
    /** The application directory (absolute). */
    readonly dir: string;
    /** Expose read-only tools only; omit `run_target` and `record_rule`. */
    readonly readOnly?: boolean;
    /** Delegate to the application's `scripts.mcp` instead of the static set. */
    readonly live?: boolean;
}

/** The missing-`mcp`-script hint, mirroring the `inspect` one (AD-70). */
const LIVE_HINT = 'add an "mcp" script that starts the application MCP server, e.g. "mcp": "tsx src/mcp.ts" (AD-70)';

/**
 * Creates the static application MCP server.
 *
 * @param options - Application directory and mode.
 * @returns A server ready to connect to a transport.
 */
export function createAppServer(options: AppServerOptions): McpServer {
    return createAppHost(options).server;
}

/**
 * Starts `ndigo mcp`. The static profile connects the tool server to stdio;
 * `--live` hands stdio to the application's `scripts.mcp` instead.
 *
 * @param options - Application directory and mode.
 * @returns A promise that settles when the server (or delegated script) ends.
 */
export async function startAppServer(options: AppServerOptions): Promise<void> {
    if (options.live === true) {
        if (options.readOnly === true) {
            throw new Error('--readOnly applies to the static profile; the live server owns its own policy');
        }
        const resolved = appScriptCommand(options.dir, 'mcp', LIVE_HINT);
        process.exitCode = await runInteractiveSpawn(resolved.argv, { cwd: resolved.cwd, env: resolved.env });
        return;
    }
    await createAppHost(options).startStdio('ndigo mcp');
}

function createAppHost(options: AppServerOptions): McpHost {
    const readOnly = options.readOnly === true;
    const context = createAppToolContext(options.dir);
    const host = createMcpHost({
        name: 'ndigo',
        version: '0.0.1',
        readOnly,
        instructions: readOnly
            ? 'Read-only Ndigo application tools: manifest, routes, configuration keys, best-practice docs, diagnostics, and logs.'
            : 'Ndigo application tools: manifest, routes, configuration keys, best-practice docs, diagnostics, logs, build/test/lint targets, and recorded rules. run_target executes the app script and returns its captured output.',
    });

    host.registerTool({
        name: 'get_manifest',
        title: 'Get the Ndigo application manifest',
        description:
            'Run the application scripts.inspect (AD-70) and return the versioned manifest: app identity, routes, mappings, and configuration keys.',
        inputSchema: {},
        annotations: { readOnlyHint: true },
        run: () => getManifest(context),
    });

    host.registerTool({
        name: 'get_routes',
        title: 'List application routes',
        description: 'Return the declarative routes from the application manifest.',
        inputSchema: {},
        annotations: { readOnlyHint: true },
        run: () => getRoutes(context),
    });

    host.registerTool({
        name: 'get_config_keys',
        title: 'List configuration keys',
        description:
            'Return the declared configuration keys. Values are never part of the manifest, so none are returned.',
        inputSchema: {},
        annotations: { readOnlyHint: true },
        run: () => getConfigKeys(context),
    });

    host.registerTool({
        name: 'get_best_practices',
        title: 'Read Ndigo best practices',
        description:
            'Return sections of the version-matched STYLE_GUIDE.md and ARCHITECTURE.md. Omit topic for the section index; pass a heading fragment for the matching bodies.',
        inputSchema: {
            topic: z.string().optional().describe('Case-insensitive heading filter, e.g. "naming" or "worktrees".'),
        },
        annotations: { readOnlyHint: true },
        run: (args) => getBestPractices(context, args),
    });

    host.registerTool({
        name: 'run_doctor',
        title: 'Run environment diagnostics',
        description: 'Run the ndigo doctor checks for the application directory and return the rows and failures.',
        inputSchema: {},
        annotations: { readOnlyHint: true },
        run: () => getDiagnostics(context),
    });

    host.registerTool({
        name: 'get_logs',
        title: 'Read application logs',
        description: 'Return the tail of the application log file (default <dir>/logs/app.log, 50 lines).',
        inputSchema: {
            file: z.string().optional().describe('Log path override.'),
            lines: z.number().int().min(1).max(1000).optional().describe('Number of tail lines (default 50).'),
        },
        annotations: { readOnlyHint: true },
        run: (args) => getLogs(context, args),
    });

    host.registerTool({
        name: 'run_target',
        title: 'Run a build, test, or lint script',
        description:
            'Run one of the application build/test/lint scripts and return the exit code plus captured stdout and stderr.',
        inputSchema: {
            target: z.enum(['build', 'test', 'lint']).describe('The app script to run.'),
        },
        annotations: { destructiveHint: true },
        mutating: true,
        run: (args) => runTarget(context, args),
    });

    host.registerTool({
        name: 'record_rule',
        title: 'Record an application rule',
        description:
            'Write one rule to .ndigo/rules/<slug>.md and regenerate .ndigo/rules/INDEX.md. Refuses to overwrite unless replace is true.',
        inputSchema: {
            name: z.string().min(1).describe('Human-readable rule name.'),
            rule: z.string().min(1).describe('The rule text.'),
            replace: z.boolean().optional().describe('Replace an existing rule file (default false).'),
        },
        annotations: { destructiveHint: true },
        mutating: true,
        run: (args) => recordRule(context, args),
    });

    return host;
}
