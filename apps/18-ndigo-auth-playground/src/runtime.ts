/**
 * The before-refresh runtime: the parts of the wiring that must finish *before*
 * the application context refreshes.
 *
 * Partitioning the demo accounts and provisioning the durable session table are
 * asynchronous, while `ApplicationBuilder` accepts zero-argument configuration
 * classes (the container constructs them itself). So the runtime is created
 * first — `createRuntime()` — and published here for
 * {@link PlaygroundConfiguration} to read at refresh time. This is the same
 * shape `05-ndigo-api` uses (`initAuth()` before the builder runs): the adapters
 * are process-global already (`AuthRegistry`), and the store/config that back
 * them are published alongside.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError } from '@ndigo/core';
import { loadConfig, type PlaygroundConfig } from './config';
import { AuthStack } from './auth-stack';

/** The wired playground: resolved configuration plus the ready auth stack. */
export interface PlaygroundRuntime {
    /** The resolved configuration. */
    readonly config: PlaygroundConfig;
    /** The auth stack: user store, durable session store, both adapters. */
    readonly stack: AuthStack;
}

let installed: PlaygroundRuntime | null = null;

/**
 * Creates the auth stack (hashing the demo accounts, provisioning the durable
 * session table) and publishes it for the configuration class.
 *
 * @param config - The resolved configuration; the environment is read when omitted.
 * @returns The published runtime.
 */
export async function createRuntime(config: PlaygroundConfig = loadConfig()): Promise<PlaygroundRuntime> {
    const stack = await AuthStack.create(config);
    const created: PlaygroundRuntime = { config, stack };
    installed = created;
    return created;
}

/**
 * The published runtime.
 *
 * @returns The runtime created by {@link createRuntime}.
 * @throws {IllegalStateError} When called before the runtime was created — a
 *   boot-ordering bug, never a runtime condition.
 */
export function runtime(): PlaygroundRuntime {
    if (installed === null) {
        throw new IllegalStateError('createRuntime() must run before the application context refreshes');
    }
    return installed;
}
