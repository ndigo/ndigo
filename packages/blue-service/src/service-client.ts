/**
 * Runtime proxy generator for declarative service clients (AD-08).
 * @module blue-service
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { HTTP, HTTPInit } from '@blue/http';
import {
    getServiceCalls,
    getServiceConfig,
    SERVICE_METADATA_KEY,
    type ServiceCallConfig,
    type ServiceClientConfig,
} from './service-decorators';
import { IllegalStateError } from '@blue/core';
import { ServerSentEventParser } from './server-sent-events';
import { ServerSentEvent } from '@blue/core';

/** Header carrying the service name for correlation/tracing. */
export const SERVICE_NAME_HEADER = 'X-Blue-Service';

/**
 * Fills `:name` path-template slots from argument values in order.
 *
 * @param template - The path template (e.g. `'/users/:id'`).
 * @param args - The method call arguments.
 * @returns The concrete path.
 */
export function fillPathTemplate(template: string, args: unknown[]): string {
    let argIndex = 0;
    return template.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, () => {
        const value = args[argIndex++];
        if (value === undefined || value === null) {
            throw new IllegalStateError(`Service call path '${template}' is missing argument #${argIndex}`);
        }
        return encodeURIComponent(String(value));
    });
}

/**
 * Builds the body for a call: the first object (non-`Request`/`Response`)
 * argument becomes JSON; otherwise no body is sent.
 *
 * @param method - The HTTP method.
 * @param args - The method call arguments.
 * @returns The body payload, or `undefined` for no body.
 */
export function resolveCallBody(method: string, args: unknown[]): unknown {
    const handled = args.findIndex(
        (arg) => arg !== undefined && typeof arg === 'object' && !(arg instanceof Request) && !(arg instanceof Response)
    );
    return handled === -1 ? undefined : args[handled];
}

/**
 * Executes a `stream: true` call: performs the HTTP request, decodes the
 * response body chunks as they arrive, and yields each parsed Server-Sent
 * Event (AD-09). With a declared `responseSchema`, each event's `data` payload
 * is validated and the typed value is yielded instead of the raw event.
 *
 * @param config - The service config (name used in error messages).
 * @param call - The call config (method, path, optional schema).
 * @param url - The fully resolved request URL.
 * @param init - The request settings (already carrying the stream Accept header).
 * @param http - The HTTP client executing the call.
 * @returns An async iterable of events (or validated data) as they arrive.
 */
async function* streamCall(
    config: ServiceClientConfig,
    call: ServiceCallConfig,
    url: string,
    init: HTTPInit,
    http: HTTP
): AsyncGenerator<unknown> {
    // The long-lived client span: an open stream call may last indefinitely,
    // and without instrumentation its full duration + event count are
    // invisible (only the X-Blue-Service header correlates it).
    const span = trace.getTracer('@blue/telemetry').startSpan('ServiceClient.streamCall', {
        kind: SpanKind.CLIENT,
        attributes: {
            'service.name': config.name,
            'http.method': call.method,
            'http.route': call.path,
        },
    });
    const began = Date.now();
    let events = 0;
    let failureRecorded = false;

    try {
        const response = await http.request(url, init);
        if (!response.ok || !response.body) {
            throw new IllegalStateError(
                `Service '${config.name}' stream request failed (HTTP ${response.status ?? 'unknown'}).`
            );
        }

        const parser = new ServerSentEventParser();
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const deliver = (event: ServerSentEvent): unknown => {
            if (!call.responseSchema) {
                return event;
            }
            const result = call.responseSchema.safeParse(event.data);
            if (!result.success) {
                const message = result.error?.issues
                    ?.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
                    .join(', ');
                throw new IllegalStateError(`Service '${config.name}' response validation failed: ${message}`);
            }
            return result.data;
        };

        // Trailing events flushed by `parser.finish()` are collected here and
        // delivered only on the normal EOF path (below). They must never be
        // yielded from inside a `finally`: a consumer that disposes the
        // generator early (`for await` break → `iterator.return()`) resumes it
        // at the pending yield and would otherwise park it forever, leaking the
        // body reader and the open OTel span (COR-8).
        const trailing: ServerSentEvent[] = [];

        try {
            for (;;) {
                // oxlint-disable-next-line no-await-in-loop -- stream consumption is inherently sequential
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                if (value.length > 0) {
                    for (const event of parser.feed(decoder.decode(value, { stream: true }))) {
                        events += 1;
                        yield deliver(event);
                    }
                }
            }
            const tail = decoder.decode();
            if (tail.length > 0) {
                for (const event of parser.feed(tail)) {
                    events += 1;
                    yield deliver(event);
                }
            }
        } catch (error: unknown) {
            failureRecorded = true;
            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR });
            if (error instanceof IllegalStateError) {
                throw error;
            }
            throw new IllegalStateError(`Service '${config.name}' stream failed: ${(error as Error).message}`);
        } finally {
            // Flush any event buffered without a trailing newline, then release
            // the reader so the underlying stream can be reused/cancelled.
            for (const event of parser.finish()) {
                trailing.push(event);
            }
            try {
                reader.releaseLock();
            } catch {
                // A read is still pending: the consumer disposed the generator
                // mid-flight. Cancel the underlying stream so the connection
                // settles and the reader lock is released promptly.
                void reader.cancel();
            }
        }

        // Deliver flushed trailing events on normal EOF only. When the consumer
        // disposed the generator early, `iterator.return()` short-circuits to
        // the outer finally, so this loop is skipped and the reader/span still
        // settle.
        for (const event of trailing) {
            events += 1;
            yield deliver(event);
        }
    } catch (error: unknown) {
        // Request-level failures (a non-OK response, transport/setup errors)
        // never reach the reader-loop catch; record them here so the span
        // always ends ERROR rather than UNSET.
        if (!failureRecorded) {
            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR });
        }
        throw error;
    } finally {
        span.setAttribute('stream.events', events);
        span.setAttribute('stream.duration_ms', Date.now() - began);
        span.end();
    }
}

/**
 * Builds a runtime service client from `@service`/`@*Call` metadata.
 *
 * @param target - The `@service`-decorated class/interface constructor or object.
 * @param http - The `@blue/http` client to delegate calls through.
 * @returns A proxy implementing the declared service methods.
 *
 * @example
 * ```ts
 * const accounts = serviceClient(AccountsAPI, http);
 * const account = await accounts.getById(42);
 * ```
 */
export function serviceClient<T extends object>(target: T, http: HTTP): T {
    const config = getServiceConfig(target as object);
    if (!config) {
        throw new IllegalStateError(
            `serviceClient: target is not @service-decorated (missing ${SERVICE_METADATA_KEY} metadata).`
        );
    }
    const calls = getServiceCalls(target as object);

    return new Proxy(target as object, {
        get(_t, prop: string | symbol) {
            if (typeof prop !== 'string') {
                return Reflect.get(target as object, prop);
            }
            // `calls` inherits from Object.prototype: only own entries are
            // call configs, everything else (`toString`, `hasOwnProperty`, …)
            // must delegate to the target.
            const call: ServiceCallConfig | undefined = Object.hasOwn(calls, prop) ? calls[prop] : undefined;
            if (!call) {
                return Reflect.get(target as object, prop);
            }

            return (...args: unknown[]): unknown => {
                const path = fillPathTemplate(call.path, args);
                const body = resolveCallBody(call.method, args);
                const url = `${config.baseUrl.replace(/\/$/, '')}${path}`;
                const headers: Record<string, string> = {
                    ...config.headers,
                    [SERVICE_NAME_HEADER]: config.name,
                };

                // Streaming call — return the event iterable directly so the
                // consumer iterates events as they arrive over the open response.
                if (call.stream) {
                    headers['Accept'] = 'text/event-stream';
                    return streamCall(config, call, url, { method: call.method, headers }, http);
                }

                const init: HTTPInit = {
                    method: call.method,
                    headers,
                    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
                };

                return http.request(url, init).then(async (response): Promise<unknown> => {
                    if (call.responseSchema) {
                        const data: unknown = await response.json().catch(() => undefined);
                        const result = call.responseSchema.safeParse(data);
                        if (!result.success) {
                            const message = result.error?.issues
                                ?.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
                                .join(', ');
                            throw new IllegalStateError(
                                `Service '${config.name}' response validation failed: ${message}`
                            );
                        }
                        return result.data;
                    }

                    return response;
                });
            };
        },
    }) as T;
}
