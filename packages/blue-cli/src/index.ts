/**
 * Public API of `@blue/cli` — the framework CLI (AD-75): serve, dev, new,
 * generate, db, inspect, doctor. The `blue` binary is the primary surface;
 * `runCli` exposes the same dispatcher to embeddings.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { execute } from '@oclif/core';

/**
 * Runs the CLI dispatcher.
 *
 * @param args - The argv after the binary name (defaults to the process argv).
 * @returns When the process completes (commands set their own exit codes).
 */
export async function runCli(args: string[] = process.argv.slice(2)): Promise<unknown> {
    return execute({ dir: import.meta.url, args });
}

export { Command, Args, Flags } from '@oclif/core';
