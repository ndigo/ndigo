/**
 * The `ndigo verify` report contract: the outcome types the check runner
 * produces and the options it accepts.
 */
import type { CapabilityEntry } from './catalog.js';

/** How a check ended.
 *
 * @example
 * ```ts
 * type _Alias = VerifyStatus;
 * ```
 */
export type VerifyStatus = 'pass' | 'fail' | 'skip';

/** One executed check.
 *
 * @example
 * ```ts
 * type _Alias = VerifyCheckResult;
 * ```
 */
export interface VerifyCheckResult {
    /** Check id, or the catalog reference with its target (`mcp-stdio:tools/list`). */
    readonly id: string;
    /** Outcome. */
    readonly status: VerifyStatus;
    /** Why it failed or was skipped; omitted on pass. */
    readonly message?: string;
    /** Wall-clock duration in milliseconds. */
    readonly durationMs: number;
}

/** Counts per outcome.
 *
 * @example
 * ```ts
 * type _Alias = VerifySummary;
 * ```
 */
export interface VerifySummary {
    /** Passing checks. */
    readonly pass: number;
    /** Failing checks. */
    readonly fail: number;
    /** Skipped checks. */
    readonly skip: number;
}

/** The machine-readable verify report.
 *
 * @example
 * ```ts
 * type _Alias = VerifyReport;
 * ```
 */
export interface VerifyReport {
    /** Whether no check failed; skipped checks do not fail the run. */
    readonly ok: boolean;
    /** Absolute application directory. */
    readonly app: string;
    /** Capability id when one was named. */
    readonly capability?: string;
    /** Checks in execution order. */
    readonly checks: readonly VerifyCheckResult[];
    /** Outcome counts. */
    readonly summary: VerifySummary;
}

/** What to verify.
 *
 * @example
 * ```ts
 * type _Alias = VerifyOptions;
 * ```
 */
export interface VerifyOptions {
    /** Absolute application directory. */
    readonly dir: string;
    /** Named capability; its checks become required rather than best-effort. */
    readonly capability?: CapabilityEntry;
    /** Every catalog capability, used to derive the union when none is named. */
    readonly catalog: readonly CapabilityEntry[];
    /** Also run the `typecheck`, `test`, and `lint` lanes. */
    readonly full?: boolean;
}
