/**
 * The backend composition root: the explicit Redis connection, its cross-node
 * socket transport, the shared cache adapter, and the socket session registry
 * the HTTP server resolves — or the in-memory equivalents when
 * `NDIGO_REDIS_URL` is unset.
 *
 * Both modes produce the same object graph shape and the same `CacheManager` /
 * registry contracts, so nothing downstream (controllers, the board socket,
 * the management health indicator) branches on the mode. Only this module does:
 * the Redis adapters are constructed and connected here, and they are the
 * resources this object hands back to the app for ordered shutdown.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
import { hostname } from 'node:os';
import { AsApplicationContextAware, ContextToken, getEnv, type ApplicationContext } from '@ndigo/context';
import { MemoryCacheManager, type CacheManager } from '@ndigo/cache';
import { NodeSocketSessionRegistry, resolveSocketRegistryOptions, type Closable } from '@ndigo/platform-node';
import { HEALTH_REGISTRY, type HealthRegistry } from '@ndigo/management';
import { RedisConnection } from '@ndigo/redis';
import { RedisSocketFanout } from '@ndigo/redis/pubsub';
import { RedisCacheManager } from '@ndigo/redis/cache';
import { BackendHealthIndicator } from './backend-health-indicator';
import { FANOUT_CACHE_NAME } from './board-message';

/** Context token for the shared {@link FanoutBackend} bean. */
export const FANOUT_BACKEND = new ContextToken<FanoutBackend>('fanoutBackend');

/** Redis namespace both nodes must agree on (cache keys and fan-out channels). */
export const DEFAULT_REDIS_NAMESPACE = 'ndigo-redis-fanout.local';

/** The app's documented dev port (the reserved 3160 slot; the second node is 3161). */
export const DEFAULT_PORT = 3160;

/** Entry lifetime for demo cache values, so two runs never share stale state. */
export const CACHE_TTL_MS = 60_000;

/** Which backend the process is running against. */
export type BackendMode = 'redis' | 'memory';

/** The report `GET /health` surfaces for this app's backend. */
export interface FanoutBackendStatus {
    /** `redis` when `NDIGO_REDIS_URL` is set, `memory` otherwise. */
    readonly mode: BackendMode;
    /** `true` while the configured backend is serving. */
    readonly connected: boolean;
    /** This process's instance id (the `from`/`producer` field on the wire). */
    readonly instanceId: string;
    /** The Redis namespace / cache namespace in use. */
    readonly namespace: string;
    /** The cache name the shared values live under. */
    readonly cacheName: string;
}

/**
 * Owns every Redis resource the app uses — plus the registry the HTTP server
 * borrows — and degrades to single-node behavior when Redis is not configured.
 *
 * Construction reads the environment once (instance id, namespace, URL) and
 * never performs I/O; {@link connect} is the explicit startup step. Ordering is
 * the one the `@ndigo/redis` README prescribes: publisher, then subscriber-side
 * fan-out, then cache, then the registry subscriptions — the registry refuses
 * to publish before its fan-out subscriptions are live, which is what keeps a
 * broken Redis from silently degrading to local-only delivery.
 */
export class FanoutBackend extends AsApplicationContextAware(Object) {
    /** Injected by the context-aware processor at bean creation. */
    readonly applicationContext!: ApplicationContext;
    /** This process's instance id; `NDIGO_INSTANCE_ID` wins over `host:port`. */
    readonly instanceId: string;
    /** The Redis namespace (fan-out channels) and cache namespace. */
    readonly namespace: string;
    /** The negotiated backend. */
    readonly mode: BackendMode;
    /** The cache name holding demo values. */
    readonly cacheName = FANOUT_CACHE_NAME;
    /** The socket session registry the HTTP server resolves as its adapter's. */
    readonly registry: NodeSocketSessionRegistry;
    /** Cross-node transport, or `undefined` in memory mode. */
    readonly fanout: RedisSocketFanout | undefined;
    /** The cache adapter: Redis-backed or in-memory, same contract. */
    readonly cacheManager: CacheManager;
    readonly #connection: RedisConnection | undefined;
    readonly #redisCache: RedisCacheManager | undefined;
    #connected = false;
    #closed = false;
    #connecting: Promise<void> | undefined;
    #closing: Promise<void> | undefined;

    /**
     * Reads the environment and builds the object graph. No connection is
     * opened (or refused) here.
     */
    constructor() {
        super();
        const port = getEnv('PORT') ?? String(DEFAULT_PORT);
        this.instanceId = getEnv('NDIGO_INSTANCE_ID') ?? `${hostname()}:${port}`;
        this.namespace = getEnv('NDIGO_REDIS_NAMESPACE') ?? DEFAULT_REDIS_NAMESPACE;
        const url = getEnv('NDIGO_REDIS_URL');
        if (url === undefined) {
            this.mode = 'memory';
            this.#connection = undefined;
            this.#redisCache = undefined;
            this.fanout = undefined;
            this.cacheManager = new MemoryCacheManager({ defaults: { defaultTtl: CACHE_TTL_MS } });
        } else {
            this.mode = 'redis';
            // The publisher is borrowed by the fan-out (the fan-out never closes
            // it); the subscriber is a separate connection the fan-out owns, and
            // the cache manager owns a third — Redis requires a dedicated
            // connection per RESP2 subscriber and per key-prefix-free database.
            this.#connection = new RedisConnection({ url });
            this.fanout = new RedisSocketFanout({
                connection: this.#connection,
                subscriberUrl: url,
                namespace: this.namespace,
            });
            this.#redisCache = new RedisCacheManager({
                url,
                namespace: this.namespace,
                defaults: { defaultTtl: CACHE_TTL_MS },
            });
            this.cacheManager = this.#redisCache;
        }
        // Heartbeat/idle knobs stay env-driven (`NDIGO_SOCKET_*`), exactly as the
        // platform default would resolve them; the fan-out is what we add.
        this.registry = new NodeSocketSessionRegistry({ ...resolveSocketRegistryOptions(), fanout: this.fanout });
    }

    /**
     * Registers the backend's health indicator once the context is available.
     *
     * Runs at bean creation, so `ManagementAutoConfiguration` must be
     * registered first — the composition root guarantees that ordering.
     *
     * @param context - The application context that owns this backend.
     */
    override setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        context.getValue<HealthRegistry>(HEALTH_REGISTRY).register(new BackendHealthIndicator(this));
    }

    /**
     * Connects the configured backend and subscribes the registry.
     *
     * Idempotent (the same promise). In memory mode only the registry is
     * brought up (a no-op without a fan-out). A Redis failure rejects before
     * the server starts: a configured-but-unreachable Redis is a startup
     * error, never a silent downgrade to single-node delivery.
     *
     * @returns A promise resolving once every resource is ready to serve.
     */
    connect(): Promise<void> {
        if (this.#closed) {
            return Promise.reject(new Error('FanoutBackend is closed'));
        }
        this.#connecting ??= this.#connect();
        return this.#connecting;
    }

    async #connect(): Promise<void> {
        // Publisher → subscriber → cache → registry subscriptions (README order).
        await this.#connection?.connect();
        await this.fanout?.connect();
        await this.#redisCache?.connect();
        await this.registry.connect();
        this.#connected = true;
    }

    /**
     * The backend's current state, for health and the cache response.
     *
     * @returns The mode, connectivity, instance id, and namespace in use.
     */
    status(): FanoutBackendStatus {
        return {
            mode: this.mode,
            // The in-memory backend needs no connection: it is available for the
            // life of the process, and only unavailable once closed.
            connected: this.mode === 'memory' ? !this.#closed : this.#connected,
            instanceId: this.instanceId,
            namespace: this.namespace,
            cacheName: this.cacheName,
        };
    }

    /**
     * This backend's resources, in shutdown order: subscriptions before the
     * transport that carries them, the transport before the publisher it
     * borrowed nothing but cannot outlive, the cache last (it is a producer).
     * The HTTP server is closed before any of these by the caller.
     *
     * @returns The closables, in the order they must be closed.
     */
    teardownResources(): Closable[] {
        const resources: Closable[] = [this.registry];
        if (this.fanout !== undefined) {
            resources.push(this.fanout);
        }
        if (this.#connection !== undefined) {
            resources.push(this.#connection);
        }
        if (this.#redisCache !== undefined) {
            resources.push(this.#redisCache);
        }
        return resources;
    }

    /**
     * Closes every resource this backend owns (idempotent). Used by tests and
     * by the startup-failure path; the running app closes them through
     * {@link teardownResources} so the server stops first.
     *
     * @returns A promise resolving once teardown has settled.
     */
    close(): Promise<void> {
        this.#closed = true;
        this.#connected = false;
        this.#closing ??= (async () => {
            // Report the first failure, but always try every resource: one hung
            // close must not strand the others (the README's shutdown rule).
            const errors: unknown[] = [];
            for (const resource of this.teardownResources()) {
                try {
                    // oxlint-disable-next-line no-await-in-loop -- dependent lifetimes: the next resource must not close before this one settles
                    await resource.close();
                } catch (error) {
                    errors.push(error);
                }
            }
            if (errors.length === 1) {
                throw errors[0];
            }
            if (errors.length > 1) {
                throw new AggregateError(errors, 'FanoutBackend close failed');
            }
        })();
        return this.#closing;
    }
}
