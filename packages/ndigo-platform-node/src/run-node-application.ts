/**
 */
import { ApplicationBuilder, StandardConfigFileLoader } from '@ndigo/boot';
import type { ConfigurableApplicationContext } from '@ndigo/context';
import { IllegalStateError } from '@ndigo/core';
import type { JSONObject } from '@ndigo/core';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { HTTP_SERVER } from './context-tokens';
import { gracefulShutdown } from './graceful-shutdown';
import type { Closable, GracefulShutdownOptions } from './graceful-shutdown';
import type { HTTPServer } from './http-server';
import { NodeAutoConfiguration } from './node-auto-configuration';
import { NodeEnvironment } from './node-environment';
import { nodeConfigFileReader } from './node-config-file-reader';

const logger = getLogger('ndigo-platform-node:run-node-application');

/**
 * Options for {@link runNodeApplication}. Every implicit action has an
 * opt-out; app-specific wiring belongs in the hooks and the returned context.
 */
export interface RunNodeApplicationOptions {
    /** Port used when `PORT` is unset; applied as the `server.port` property. */
    port?: number;
    /** Active profiles. `NDIGO_PROFILES_ACTIVE` and `--profiles.active` still take precedence. */
    profiles?: readonly string[];
    /** Extra builder properties, merged above the `systemEnvironment` source. */
    properties?: JSONObject;
    /**
     * `true` (default) loads config files through {@link nodeConfigFileReader}
     * (probe locations `./config/` and `./`, overridable via
     * `NDIGO_CONFIG_LOCATION`); `false` disables file loading, and a loader
     * instance overrides both.
     */
    configFiles?: boolean | StandardConfigFileLoader;
    /** `true` (default) registers {@link NodeAutoConfiguration}. */
    platform?: boolean;
    /**
     * Extends the preset's builder wiring — secrets, the remote config
     * source, interception processors, defaults — after the preset's own
     * settings and before `run()`. The escape hatch for app-specific
     * configuration that must land before refresh.
     */
    configureBuilder?: (builder: ApplicationBuilder) => void | Promise<void>;
    /**
     * Runs after the context is refreshed and before the socket binds — the
     * seam for migrations, interceptor registration, and session restore.
     */
    beforeStart?: (context: ConfigurableApplicationContext) => void | Promise<void>;
    /** Extra resources closed after the server and before the context. */
    resources?: readonly Closable[];
    /** `true` (default) installs the `SIGINT`/`SIGTERM` teardown. */
    shutdown?: boolean | Omit<GracefulShutdownOptions, 'resources'>;
}

/**
 * A booted Node application: the refreshed context, the started server, the
 * bound port, and a programmatic teardown.
 */
export interface NodeApplication {
    /** The refreshed context — every bean stays reachable. */
    readonly context: ConfigurableApplicationContext;
    /** The started managed server. */
    readonly server: HTTPServer;
    /** The bound port (the ephemeral port when `port: 0` was requested). */
    readonly port: number;
    /** Closes the server, the extra resources, and the context. Idempotent. */
    close(): Promise<void>;
}

/**
 * Runs a Node application: builds the context (`NodeAutoConfiguration` and
 * `NodeEnvironment` by default), loads config files, starts the managed
 * `HTTP_SERVER`, and wires `SIGINT`/`SIGTERM` to a graceful teardown.
 *
 * Composes the existing pieces rather than replacing them — the returned
 * context is the same container `ApplicationBuilder` would have produced, so
 * every bean stays reachable and full manual control remains one
 * `ApplicationBuilder` away. Startup failures are logged and rethrown (never
 * `process.exit`); the caller's top-level `await` decides the exit code.
 *
 * @example
 * ```ts
 * const app = await runNodeApplication([AppConfiguration], { port: 3000 });
 * logger.info(`listening on http://127.0.0.1:${app.port}`);
 * ```
 *
 * @param sources - Application source classes (configurations, controllers, …).
 * @param options - Preset options; every implicit action has an opt-out.
 * @returns The booted application.
 */
export async function runNodeApplication(
    sources: readonly Function[],
    options: RunNodeApplicationOptions = {}
): Promise<NodeApplication> {
    const builder = new ApplicationBuilder([
        ...((options.platform ?? true) ? [NodeAutoConfiguration] : []),
        ...sources,
    ]).environment(new NodeEnvironment());

    if (options.profiles?.length) {
        builder.profiles(...options.profiles);
    }

    const properties: JSONObject = { ...options.properties };
    if (options.port !== undefined) {
        properties['server.port'] = options.port;
    }
    if (Object.keys(properties).length > 0) {
        builder.properties(properties);
    }

    const configFiles = options.configFiles ?? true;
    if (configFiles !== false) {
        builder.configFiles(
            configFiles === true ? new StandardConfigFileLoader({ reader: nodeConfigFileReader }) : configFiles
        );
    }

    try {
        await options.configureBuilder?.(builder);
    } catch (error) {
        logger.error(`Startup failed: ${getErrorMessage(error)}`);
        throw error;
    }

    const context = await builder.run();

    try {
        await options.beforeStart?.(context);
    } catch (error) {
        logger.error(`Startup failed: ${getErrorMessage(error)}`);
        context.close();
        throw error;
    }

    if (!context.hasValue(HTTP_SERVER)) {
        context.close();
        throw new IllegalStateError(
            'runNodeApplication: no HTTP_SERVER bean in the context — register NodeAutoConfiguration (the default) or provide your own `httpServer` entry'
        );
    }

    const server = context.getValue(HTTP_SERVER);
    try {
        await server.start();
    } catch (error) {
        logger.error(`Startup failed: ${getErrorMessage(error)}`);
        context.close();
        throw error;
    }

    const extraResources = options.resources ?? [];
    let unregisterSignals: (() => void) | undefined;
    if (options.shutdown !== false) {
        const shutdownOptions = typeof options.shutdown === 'object' ? options.shutdown : {};
        unregisterSignals = gracefulShutdown(context, { ...shutdownOptions, resources: [server, ...extraResources] });
    }

    let closed = false;
    const close = async (): Promise<void> => {
        if (closed) return;
        closed = true;
        unregisterSignals?.();
        try {
            await server.close();
            for (const resource of extraResources) {
                // eslint-disable-next-line no-await-in-loop -- sequential teardown is intentional: resources close in order, after the server and before the context
                await resource.close();
            }
        } finally {
            context.close();
        }
    };

    return { context, server, port: server.port, close };
}
