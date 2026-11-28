/**
 * Declarative service calls: execution chains, interceptors, and HTTP transport.
 */
import { IllegalStateError } from '@ndigo/core';
import { AsyncDestroyable } from '@ndigo/factory';
import type { HTTP } from '@ndigo/http';
import { MappedServiceInterceptor } from './mapped-service-interceptor.js';
import { ServiceExecutionChain } from './service-execution-chain.js';
import type { ServiceInit, ServiceInterceptor } from './service-types.js';
import { ServiceRegistry } from './service-registry';
import { TelemetryHooks } from './telemetry-hooks';
import { RequestIdCorrelation } from './request-id-correlation';

const { defineProperty } = Reflect;

let serviceId = 0;

/**
 * Allocates the next monotonic service id.
 *
 * @returns The next service id.
 */
function nextServiceId(): number {
    return ++serviceId;
}

/**
 * A service that provides a high-level API for interacting with remote endpoints.
 *
 * @example
 * ```ts
 * const service = new Service('UserService', http, registry, telemetry, correlation);
 * ```
 */
export class Service implements AsyncDestroyable {
    #interceptors: ServiceInterceptor[] = [];
    #registry: ServiceRegistry;
    #telemetry: TelemetryHooks;
    #correlation: RequestIdCorrelation;
    #http: HTTP;

    /** Monotonic identifier assigned when the service is created. */
    id!: number;
    /** The service name, used for correlation headers and diagnostics. */
    name!: string;
    /** Whether {@link Service.destroy} has run. */
    destroyed!: boolean;

    get [Symbol.toStringTag](): string {
        return `Service:${this.name}`;
    }

    constructor(
        name: string,
        http: HTTP,
        registry: ServiceRegistry,
        telemetry: TelemetryHooks,
        correlation: RequestIdCorrelation
    ) {
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'id', {
            value: nextServiceId(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#http = http;
        this.#registry = registry;
        this.#telemetry = telemetry;
        this.#correlation = correlation;
    }

    /**
     * Adds a service interceptor to the chain.
     *
     * @param interceptor - Interceptor to add.
     */
    addInterceptor(interceptor: ServiceInterceptor): void {
        if (interceptor) {
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * Executes a service call.
     *
     * @param token - The service token to resolve.
     * @param data - Request payload.
     * @param init - Service initialization settings.
     * @returns A promise that resolves to the service response.
     */
    async call(token: string, data: unknown, init: ServiceInit = {}): Promise<Response> {
        const endpoint = this.#registry.getEndpoint(token);
        if (!endpoint) {
            throw new IllegalStateError(`Service token '${token}' not registered.`);
        }

        const url = new URL(endpoint);

        // Each call stamps a FRESH correlation id held in a local — never the
        // shared `RequestIdCorrelation` state. Concurrent (or nested) calls
        // therefore each carry their own id with no save/restore window to
        // clobber or leak one another's value (PLN-F7). Apps that need an
        // ambient id can still get/set one on the correlation entry directly;
        // per-call stamping must not mutate it.
        const correlationId = this.#correlation.generateRequestId();

        const headers = new Headers(init.headers);
        headers.set('X-Correlation-ID', correlationId);
        const settings = Object.assign({}, init, { headers });

        this.#telemetry.onRequest(new Request(url.toString(), settings));

        try {
            const response = await this.#http.request(url.toString(), settings);
            this.#telemetry.onResponse(response);
            return response;
        } catch (error) {
            this.#telemetry.onError(error as Error);
            throw error;
        }
    }

    /**
     * Marks the service as destroyed.
     *
     * @returns A promise that resolves once the service is marked destroyed.
     */
    async destroy(): Promise<void> {
        this.destroyed = true;
    }

    /**
     * Builds the interceptor chain for one call, filtering path-mapped
     * interceptors by `path`.
     *
     * @param service - The service (or an existing chain) to execute.
     * @param path - The concrete request path used for include/exclude matching.
     * @returns A chain carrying the interceptors that apply to the call.
     */
    protected _getServiceExecutionChain(service: Service | ServiceExecutionChain, path: string): ServiceExecutionChain {
        const chain = service instanceof ServiceExecutionChain ? service : new ServiceExecutionChain(service),
            interceptors = this.#interceptors,
            length = interceptors?.length;

        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (interceptor instanceof MappedServiceInterceptor) {
                    if (interceptor.matches(path)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                } else {
                    chain.addInterceptor(interceptor);
                }
            }
        }

        return chain;
    }
}

export * from './service-types.js';
export * from './mapped-service-interceptor.js';
export * from './service-execution-chain.js';
