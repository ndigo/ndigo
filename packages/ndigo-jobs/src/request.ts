/**
 * Payload and request helpers shared by every driver implementation.
 *
 * These are the driver-authoring surface: a backend persists the record
 * produced by {@link resolveJobRequest} and stores the text produced by
 * {@link serializeJobPayload} — nothing else is contract.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@ndigo/core';
import type { JobRequest, ResolvedJobRequest } from './job';

/**
 * Attempts a job allows when the request does not say otherwise.
 */
export const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Validates a producer request and resolves its defaults against `now`
 * (`runAt ?? now + delayMs ?? now`, `maxAttempts ?? DEFAULT_MAX_ATTEMPTS`).
 *
 * Throws for: a non-object request, an empty `type`, `delayMs` together with
 * `runAt`, negative/non-finite times, and non-integer attempt/timeout values.
 *
 * @param request - The producer-supplied request.
 * @param now - Current epoch milliseconds (injected for determinism).
 * @returns The normalized request drivers store.
 */
export function resolveJobRequest(request: JobRequest, now: number): ResolvedJobRequest {
    if (request === null || typeof request !== 'object') {
        throw new TypeError(`job request: expected an object, got ${typeof request}`);
    }
    const { type, payload, delayMs, runAt, maxAttempts, timeoutMs } = request;

    if (typeof type !== 'string' || type.trim().length === 0) {
        throw new TypeError(`job request: 'type' must be a non-empty string, got ${JSON.stringify(type)}`);
    }
    if (delayMs !== undefined && runAt !== undefined) {
        throw new TypeError(`job request '${type}': delayMs and runAt are mutually exclusive — pass one`);
    }
    if (delayMs !== undefined && (!Number.isFinite(delayMs) || delayMs < 0)) {
        throw new TypeError(
            `job request '${type}': delayMs must be a non-negative finite number, got ${String(delayMs)}`
        );
    }
    if (runAt !== undefined && !Number.isFinite(runAt)) {
        throw new TypeError(
            `job request '${type}': runAt must be a finite epoch-milliseconds number, got ${String(runAt)}`
        );
    }
    if (maxAttempts !== undefined && (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1)) {
        throw new TypeError(
            `job request '${type}': maxAttempts must be a positive integer, got ${String(maxAttempts)}`
        );
    }
    if (timeoutMs !== undefined && (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1)) {
        throw new TypeError(`job request '${type}': timeoutMs must be a positive integer, got ${String(timeoutMs)}`);
    }

    const resolvedRunAt = runAt ?? (delayMs !== undefined ? now + delayMs : now);
    return {
        type,
        payload,
        runAt: resolvedRunAt,
        maxAttempts: maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
        ...(timeoutMs !== undefined ? { timeoutMs } : {}),
    };
}

/**
 * Serializes a job payload to the stored JSON text.
 *
 * Fails loud on values JSON cannot carry faithfully: functions, symbols,
 * bigints (native `JSON.stringify` would drop them silently), and `undefined`
 * **members** — those vanish without a trace under `stringify`, so a producer
 * would lose fields with no error (AD-72 D-2). A payload that IS `undefined`
 * at the top level is normalized to `null` (the documented explicit-absence
 * carrier), and circular structures throw natively.
 *
 * @param payload - The payload to serialize.
 * @returns The JSON text a driver stores.
 */
export function serializeJobPayload(payload: unknown): string {
    const serialized = JSON.stringify(payload ?? null, (_key, value: unknown) => {
        if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
            throw new TypeError(`job payload must be JSON-serializable — found a ${typeof value} value`);
        }
        if (value === undefined) {
            throw new TypeError('job payload member must not be undefined — JSON would drop it silently; use null');
        }
        return value;
    });
    if (serialized === undefined) {
        throw new TypeError('job payload must be JSON-serializable');
    }
    return serialized;
}

/**
 * Parses stored payload text back to its value.
 *
 * @param serialized - The stored JSON text.
 * @returns The payload value.
 */
export function parseJobPayload(serialized: string): unknown {
    try {
        return JSON.parse(serialized) as unknown;
    } catch (error) {
        throw new FrameworkError('stored job payload is not valid JSON', { cause: error });
    }
}
