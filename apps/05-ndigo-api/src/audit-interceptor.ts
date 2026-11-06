/**
 * Audit demo gate for `@ndigo/proxy` (AD-42 D-8): a `MethodInterceptor` +
 * annotation key pair that records every advised call in memory.
 */
import { methodAnnotation, type MethodDescriptor, type MethodInvocation, type MethodInterceptor } from '@ndigo/proxy';

/**
 * Annotation key for `@ndigo/proxy` audit policy: methods carrying
 * `@audited({ action })` are recorded by the registered
 * {@link AuditInterceptor}.
 */
export const audited = methodAnnotation<{ action: string }>('audited');

/**
 * Records `action:method` entries for every advised call. Register the same
 * instance with `interception([audit])` via `context.addProcessor(...)`.
 */
export class AuditInterceptor implements MethodInterceptor {
    #entries: string[] = [];

    matches(method: MethodDescriptor): boolean {
        return method.annotation(audited) !== undefined;
    }

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
