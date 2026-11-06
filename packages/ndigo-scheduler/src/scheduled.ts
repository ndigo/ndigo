/**
 * The `@scheduled` decorator and its metadata key.
 */
import '@tsmetadata/polyfill';
import { Cron } from 'croner';
import { FrameworkError } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';
import { isValidTimeZone } from './time-zones';
import { NormalizedScheduledSpec, ScheduledSpec, parseDuration } from './spec';

/**
 * Metadata key prefix under which `@scheduled` writes its per-method spec
 * (`schedule:<methodName>`).
 */
export const SCHEDULED_METADATA_PREFIX = 'schedule:';

/**
 * Parses a duration field that arrived as `unknown` (from object spread
 * narrowing), after validating it is a {@link DurationValue}.
 *
 * @param value - The raw field value.
 * @param label - Field name used in error messages.
 * @param options - Forwarded to {@link parseDuration} (positive intervals).
 * @returns The duration in milliseconds.
 */
function parseDurationValue(value: unknown, label: string, options?: { positive?: boolean }): number {
    if (typeof value !== 'number' && typeof value !== 'string') {
        throw new TypeError(`${label}: expected milliseconds or a '10s'-style string, got ${typeof value}`);
    }
    return parseDuration(value, label, options);
}

/**
 * Distributed lock names: identifier characters matching the Redis-key and
 * in-process namespaces (mirrors the lock drivers' own key rule).
 */
const lockNamePattern = /^[A-Za-z0-9._:-]+$/;

/**
 * Normalizes and validates the AD-73 lock options shared by both spec
 * forms: `lock`, `lockWait`, `lockWaitStep`, `lockTtl`.
 *
 * @param spec - The raw spec object (unknown-typed via narrowing).
 * @returns The normalized lock fields; absent when `lock` is absent.
 * @throws {TypeError} On a malformed lock name or duration.
 */
function resolveLockFields(spec: { lock?: unknown; lockWait?: unknown; lockWaitStep?: unknown; lockTtl?: unknown }): {
    lockKey?: string;
    lockWaitMs?: number;
    lockWaitStepMs?: number;
    lockTtlMs?: number;
} {
    const { lock, lockWait, lockWaitStep, lockTtl } = spec;
    if (lock === undefined) {
        return {};
    }
    if (typeof lock !== 'string' || !lockNamePattern.test(lock)) {
        throw new TypeError(`@scheduled: invalid lock name ${JSON.stringify(lock)} — use [A-Za-z0-9._:-] characters`);
    }
    return {
        lockKey: lock,
        ...(lockWait !== undefined ? { lockWaitMs: parseDurationValue(lockWait, 'lockWait') } : {}),
        ...(lockWaitStep !== undefined
            ? { lockWaitStepMs: parseDurationValue(lockWaitStep, 'lockWaitStep', { positive: true }) }
            : {}),
        ...(lockTtl !== undefined ? { lockTtlMs: parseDurationValue(lockTtl, 'lockTtl', { positive: true }) } : {}),
    };
}

/**
 * Normalizes and validates a {@link ScheduledSpec} into its canonical form.
 *
 * Throws at decoration time for malformed cron expressions, durations, and
 * time zones — in any environment importing the module, the browser
 * included (AD-20 D5.2).
 *
 * @param spec - The supplied schedule.
 * @returns The normalized schedule record.
 */
export function resolveScheduledSpec(spec: ScheduledSpec): NormalizedScheduledSpec {
    if (typeof spec === 'string') {
        return resolveScheduledSpec({ cron: spec });
    }
    if (spec === null || typeof spec !== 'object') {
        throw new TypeError(`@scheduled: expected a cron string or spec object, got ${typeof spec}`);
    }

    if ('cron' in spec && typeof spec.cron === 'string') {
        const timeZone = 'timeZone' in spec && typeof spec.timeZone === 'string' ? spec.timeZone : undefined;
        const maxRunTime = 'maxRunTime' in spec ? spec.maxRunTime : undefined;

        validateCron(spec.cron);
        if (timeZone !== undefined && !isValidTimeZone(timeZone)) {
            throw new TypeError(
                `@scheduled: invalid time zone '${timeZone}' — use an IANA identifier (see TimeZones) and check for typos`
            );
        }
        return {
            cron: spec.cron,
            ...(timeZone !== undefined ? { timeZone } : {}),
            ...(maxRunTime !== undefined ? { maxRunTimeMs: parseDurationValue(maxRunTime, 'maxRunTime') } : {}),
            ...resolveLockFields(spec),
        };
    }

    const fixedRate = 'fixedRate' in spec ? spec.fixedRate : undefined;
    const fixedDelay = 'fixedDelay' in spec ? spec.fixedDelay : undefined;
    const maxRunTime = 'maxRunTime' in spec ? spec.maxRunTime : undefined;

    if (fixedRate === undefined && fixedDelay === undefined) {
        throw new TypeError(
            '@scheduled: unknown spec — expected a cron string, { cron } or { fixedRate | fixedDelay }'
        );
    }
    if (fixedRate !== undefined && fixedDelay !== undefined) {
        throw new TypeError('@scheduled: interval specs need exactly one of fixedRate or fixedDelay');
    }

    return {
        ...(fixedRate !== undefined
            ? { fixedRateMs: parseDurationValue(fixedRate, 'fixedRate', { positive: true }) }
            : {}),
        ...(fixedDelay !== undefined
            ? { fixedDelayMs: parseDurationValue(fixedDelay, 'fixedDelay', { positive: true }) }
            : {}),
        ...(maxRunTime !== undefined ? { maxRunTimeMs: parseDurationValue(maxRunTime, 'maxRunTime') } : {}),
        ...resolveLockFields(spec),
    };
}

/**
 * Throws when the cron expression does not parse.
 *
 * @param expression - The cron expression to validate.
 */
function validateCron(expression: string): void {
    try {
        new Cron(expression);
    } catch (error) {
        throw new TypeError(`@scheduled: invalid cron expression '${expression}' — ${getErrorMessage(error)}`, {
            cause: error,
        });
    }
}

/**
 * Marks a method as a scheduled task (AD-20 D1).
 *
 * Node-only: the decorator refuses to apply in environments without a
 * `process` global (genuine browsers). Bundlers that polyfill `process` can
 * evade the runtime check — the `no-scheduled-in-browser` lint rule covers
 * repository code and docs cover the rest (AD-20 D5.3).
 *
 * @param spec - A cron string, `{ cron }`, or `{ fixedRate | fixedDelay }`
 *   specification (with optional `timeZone` and `maxRunTime`).
 * @returns The class method decorator.
 */
export function scheduled(spec: ScheduledSpec) {
    const normalized = resolveScheduledSpec(spec);

    if (typeof process === 'undefined') {
        throw new FrameworkError(
            '@scheduled is a Node-only decorator — scheduled tasks cannot run in the browser. Move the task to a server-side class.'
        );
    }

    return function (value: Function, context: ClassMethodDecoratorContext): void {
        if (context.kind !== 'method') {
            throw new TypeError(`@scheduled can only be applied to a method — received '${context.kind}'.`);
        }
        void value;
        context.metadata[`${SCHEDULED_METADATA_PREFIX}${String(context.name)}`] = normalized;
    };
}

/**
 * Reads the schedule recorded by `@scheduled` for a method.
 *
 * @param target - The decorated class constructor.
 * @param methodName - The decorated method name.
 * @returns The normalized schedule, or `undefined` when not scheduled.
 */
export function getScheduledSpec(target: object, methodName: string): NormalizedScheduledSpec | undefined {
    const metadata = (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
    return metadata[`${SCHEDULED_METADATA_PREFIX}${methodName}`] as NormalizedScheduledSpec | undefined;
}
