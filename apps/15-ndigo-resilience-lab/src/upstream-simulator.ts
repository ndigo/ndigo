/**
 * The controllable flaky upstream: a pure behaviour engine the lab points its
 * consumer at, with modes chosen to drive retry and circuit-breaker
 * transitions (always-fail, N-then-recover, F/S patterns, latency).
 */
import { setTimeout as delay } from 'node:timers/promises';
import type { UpstreamMode, UpstreamModeInput, UpstreamModeName, UpstreamOutcome } from './lab-types';

/** The behaviour families the control plane accepts. */
const MODE_NAMES: readonly UpstreamModeName[] = ['ok', 'error', 'fail', 'pattern', 'delay'];

/** Longest accepted `pattern` (the cycle repeats, so a short one suffices). */
const MAX_PATTERN_LENGTH = 64;

/** Longest `delay` the upstream will honour (keeps a stuck lab observable). */
const MAX_DELAY_MS = 30_000;

/** The default failure status: a retryable, transient server error. */
const DEFAULT_FAILURE_STATUS = 503;

/**
 * Coerces a control-plane value (string from a query, number from JSON) into a
 * bounded integer.
 *
 * @param value - The raw value; `undefined` returns `fallback`.
 * @param name - Field name for the error message.
 * @param options - Bounds and the fallback value.
 * @returns The validated integer.
 * @throws {TypeError} When the value is not an integer within `[min, max]`.
 */
function toBoundedInteger(
    value: unknown,
    name: string,
    options: { min: number; max: number; fallback: number }
): number {
    if (value === undefined || value === null || value === '') {
        return options.fallback;
    }
    const parsed = typeof value === 'number' ? value : Number(String(value).trim());
    if (!Number.isInteger(parsed) || parsed < options.min || parsed > options.max) {
        throw new TypeError(`${name} must be an integer in [${options.min}, ${options.max}] — got ${String(value)}`);
    }
    return parsed;
}

/**
 * Normalizes and validates a control-plane mode setting.
 *
 * @param input - Query/body fields; missing fields take documented defaults.
 * @returns The normalized {@link UpstreamMode}.
 * @throws {TypeError} When any field is out of range or the pattern is invalid.
 */
export function normalizeUpstreamMode(input: UpstreamModeInput): UpstreamMode {
    const rawName = input.mode === undefined || input.mode === null ? 'ok' : String(input.mode).trim().toLowerCase();
    const mode = MODE_NAMES.find((candidate) => candidate === rawName);
    if (mode === undefined) {
        throw new TypeError(`mode must be one of ${MODE_NAMES.join(', ')} — got ${String(input.mode)}`);
    }

    const status = toBoundedInteger(input.status, 'status', {
        min: 400,
        max: 599,
        fallback: DEFAULT_FAILURE_STATUS,
    });
    const count = toBoundedInteger(input.count, 'count', { min: 0, max: 10_000, fallback: 0 });
    const delayMs = toBoundedInteger(input.delayMs, 'delayMs', { min: 0, max: MAX_DELAY_MS, fallback: 0 });

    let pattern = '';
    if (mode === 'pattern') {
        pattern = String(input.pattern ?? '')
            .trim()
            .toUpperCase();
        if (pattern.length === 0 || pattern.length > MAX_PATTERN_LENGTH || /[^FS]/.test(pattern)) {
            throw new TypeError(
                `pattern must be a non-empty F/S sequence of at most ${MAX_PATTERN_LENGTH} characters — got ${String(input.pattern)}`
            );
        }
    }

    return { mode, status, count, pattern, delayMs };
}

/**
 * Serves the simulated upstream responses.
 *
 * The engine is deterministic: the same mode plus the same call sequence always
 * produces the same outcomes, so retry and breaker assertions never depend on
 * randomness or wall time (only `delay` mode consumes time, and only when the
 * control plane explicitly asks for it).
 */
export class UpstreamSimulator {
    #mode: UpstreamMode = { mode: 'ok', status: DEFAULT_FAILURE_STATUS, count: 0, pattern: '', delayMs: 0 };
    #remainingFailures = 0;
    #patternIndex = 0;
    #lastStatus: number | null = null;

    /**
     * Applies a new behaviour, resetting the per-mode budgets (`count` and the
     * pattern cursor) so a setting always starts from a known position.
     *
     * @param input - The raw control-plane setting.
     * @returns The normalized mode that took effect.
     */
    setMode(input: UpstreamModeInput): UpstreamMode {
        const mode = normalizeUpstreamMode(input);
        this.#mode = mode;
        this.#remainingFailures = mode.mode === 'fail' ? mode.count : 0;
        this.#patternIndex = 0;
        return mode;
    }

    /**
     * The state the control plane reports alongside the counters.
     */
    snapshot(): {
        mode: UpstreamMode;
        lastStatus: number | null;
        remainingFailureBudget: number;
        patternIndex: number;
    } {
        return {
            mode: this.#mode,
            lastStatus: this.#lastStatus,
            remainingFailureBudget: this.#remainingFailures,
            patternIndex: this.#patternIndex,
        };
    }

    /**
     * Applies the active behaviour to one call.
     *
     * @returns The simulated response.
     */
    async serve(): Promise<UpstreamOutcome> {
        const mode = this.#mode;
        let failed: boolean;

        switch (mode.mode) {
            case 'error':
                failed = true;
                break;
            case 'fail':
                failed = this.#remainingFailures > 0;
                if (failed) {
                    this.#remainingFailures -= 1;
                }
                break;
            case 'pattern': {
                const step = mode.pattern[this.#patternIndex % mode.pattern.length];
                this.#patternIndex += 1;
                failed = step === 'F';
                break;
            }
            case 'delay':
                await delay(mode.delayMs);
                failed = false;
                break;
            default:
                failed = false;
        }

        const status = failed ? mode.status : 200;
        this.#lastStatus = status;
        const body: Record<string, unknown> = failed
            ? { error: 'upstream_failure', mode: mode.mode, status }
            : { value: 'upstream-ok', mode: mode.mode, servedAt: new Date().toISOString() };

        return { ok: !failed, status, body };
    }
}
