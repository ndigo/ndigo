/**
 * Audit demo gate for `@ndigo/advice`: an annotation key plus a
 * `MethodInterceptor` that records every advised call in memory.
 */
import { methodAnnotation } from '@ndigo/core';
import type { MethodInvocation, MethodInterceptor } from '@ndigo/advice';

/**
 * Annotation key for the audit policy: methods carrying
 * `@audited({ action })` are recorded by the registered
 * {@link AuditInterceptor}.
 */
export const audited = methodAnnotation<{ action: string }>('audit:action');

/**
 * Records `action:method` entries for every advised call. Register the same
 * instance with `interception([{ when: hasAnnotation(audited), use: audit }])`
 * via `context.addProcessor(...)`.
 */
export class AuditInterceptor implements MethodInterceptor {
    #entries: string[] = [];

    invoke(invocation: MethodInvocation, next: () => unknown): unknown {
        const spec = invocation.annotation(audited);
        if (spec !== undefined) {
            this.#entries.push(`${spec.action}:${String(invocation.methodName)}`);
        }
        return next();
    }

    /**
     * Recorded entries since construction (`action:method`).
     */
    entries(): readonly string[] {
        return [...this.#entries];
    }
}
