/**
 * Minimal MCP stdio probe for `ndigo verify`: spawn the application's `mcp`
 * script, perform the initialize handshake, and read `tools/list`.
 *
 * Deliberately hand-rolled JSON-RPC over newline-delimited stdio: verify must
 * work against the app's own script without importing the app's dependencies
 * or linking the SDK into the probe.
 */
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { appScriptCommand } from '../helpers/app-scripts.js';

/** How long the whole handshake (initialize plus tools/list) may take. */
const PROBE_TIMEOUT_MS = 15_000;

/** How much stdout the probe buffers while waiting for a complete response. */
const MAX_PROBE_BUFFER_CHARS = 1024 * 1024;

/** The hint shown when the app has no `mcp` script. */
const MCP_HINT = 'install the agent-surface capability (`ndigo add agent-surface --apply`)';

/** One JSON-RPC response envelope. */
interface JSONRPCResponse {
    readonly id?: number;
    readonly result?: unknown;
    readonly error?: { readonly message?: string };
}

/**
 * Reads the tool names an application's stdio MCP server publishes.
 *
 * @param dir - Application directory.
 * @returns The `tools/list` names, in server order.
 * @throws When the script is missing, exits, times out, or returns an error.
 */
export async function probeMcpTools(dir: string): Promise<string[]> {
    const { argv, cwd, env } = appScriptCommand(dir, 'mcp', MCP_HINT);
    const command = argv[0];
    if (command === undefined) throw new Error('the "mcp" script resolves to an empty command');

    const child = spawn(command, argv.slice(1), { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
    try {
        return await handshake(child);
    } finally {
        child.kill('SIGTERM');
        // A server that ignores SIGTERM must not keep verify alive.
        setTimeout(() => child.kill('SIGKILL'), 1_000).unref();
    }
}

function handshake(child: ChildProcess): Promise<string[]> {
    return new Promise<string[]>((resolvePromise, rejectPromise) => {
        const tools: string[] = [];
        let buffer = '';
        let stderr = '';
        let settled = false;
        let initialized = false;

        const finish = (error: Error | null): void => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error === null) resolvePromise(tools);
            else rejectPromise(error);
        };

        const timer = setTimeout(() => {
            finish(new Error(`no tools/list response within ${PROBE_TIMEOUT_MS} ms${tail(stderr)}`));
        }, PROBE_TIMEOUT_MS);

        child.stderr?.setEncoding('utf8');
        child.stderr?.on('data', (chunk: string) => {
            stderr = `${stderr}${chunk}`.slice(-2_000);
        });
        child.once('error', (error) => finish(new Error(`cannot start the "mcp" script: ${error.message}`)));
        child.once('exit', (code) => {
            finish(new Error(`the "mcp" script exited (${String(code)}) before tools/list${tail(stderr)}`));
        });
        // A dying server takes its stdin with it, and the handshake's
        // follow-up writes then surface as EPIPE on this stream. Route the
        // error into `finish` instead of letting the unhandled event crash
        // the whole CLI — verify exists to check broken apps.
        child.stdin?.on('error', (error: Error) => {
            finish(new Error(`cannot write to the "mcp" script: ${error.message}${tail(stderr)}`));
        });

        child.stdout?.setEncoding('utf8');
        child.stdout?.on('data', (chunk: string) => {
            // The server may have died while this chunk was in flight; once
            // the handshake is settled, neither parse further nor write into
            // its dead stdin.
            if (settled) return;
            buffer += chunk;
            if (buffer.length > MAX_PROBE_BUFFER_CHARS) {
                finish(
                    new Error(
                        `the "mcp" script wrote more than ${MAX_PROBE_BUFFER_CHARS} characters without a complete response${tail(stderr)}`
                    )
                );
                return;
            }
            for (;;) {
                const newline = buffer.indexOf('\n');
                if (newline === -1) break;
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (line === '') continue;
                let message: JSONRPCResponse;
                try {
                    message = JSON.parse(line) as JSONRPCResponse;
                } catch {
                    continue;
                }
                if (message.id === 1) {
                    if (message.error?.message !== undefined) {
                        finish(new Error(`initialize failed: ${message.error.message}`));
                        return;
                    }
                    // The peer accepted initialize; declare the session ready
                    // before asking for the tool list.
                    child.stdin?.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
                    child.stdin?.write(
                        `${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`
                    );
                    initialized = true;
                } else if (message.id === 2) {
                    if (message.error?.message !== undefined) {
                        finish(new Error(`tools/list failed: ${message.error.message}`));
                        return;
                    }
                    const result = message.result as { tools?: readonly { name?: unknown }[] } | undefined;
                    for (const tool of result?.tools ?? []) {
                        if (typeof tool.name === 'string') tools.push(tool.name);
                    }
                    finish(null);
                    return;
                } else if (initialized === false && message.id === undefined && message.error?.message !== undefined) {
                    finish(new Error(message.error.message));
                    return;
                }
            }
        });

        child.stdin?.write(
            `${JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    clientInfo: { name: 'ndigo-verify', version: '0.0.1' },
                },
            })}\n`
        );
    });
}

function tail(stderr: string): string {
    const trimmed = stderr.trim();
    if (trimmed === '') return '';
    const lines = trimmed.split('\n').slice(-5).join('\n');
    return ` — stderr:\n${lines}`;
}
