/**
 * The lab's failing responses as RFC 9457 problem documents (AD-10: every
 * 4xx/5xx `ResponseEntity` is problem+json).
 *
 * `ResponseEntityView` renders a body that already carries a numeric `status`
 * verbatim, so a problem document built here keeps the lab's own extension
 * members (`ok`, `upstreamAttempts`, `error`, …) instead of being re-wrapped
 * into a bare `{status, title, detail, instance}` — machine-readable errors on
 * every failing route.
 * @module blue-resilience-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ResponseStatus } from '@blue/http';
import { ResponseEntity } from '@blue/platform-node';

/**
 * Options for {@link labProblem}.
 */
export interface LabProblemOptions {
    /** The HTTP status of the problem. */
    readonly status: ResponseStatus;
    /** Human-readable summary of the failure. */
    readonly title: string;
    /** What went wrong, for a human. */
    readonly detail: string;
    /** Optional problem type URI (e.g. `urn:blue:service-unavailable`). */
    readonly type?: string;
    /** Lab extension members serialized alongside the standard problem members. */
    readonly extensions?: Record<string, unknown>;
}

/**
 * Builds a failing response as a problem document with extension members.
 *
 * @param options - Status, title, detail, and the members to add.
 * @returns The response entity the view renders as `application/problem+json`.
 */
export function labProblem(options: LabProblemOptions): ResponseEntity<Record<string, unknown>> {
    return new ResponseEntity(
        {
            status: options.status.code,
            ...(options.type === undefined ? {} : { type: options.type }),
            title: options.title,
            detail: options.detail,
            ...options.extensions,
        },
        options.status
    );
}
