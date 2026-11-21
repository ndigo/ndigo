/**
 * `@traced` annotation and trace metadata readers.
 *
 * The decorator declares the span name on the class; the span itself is
 * opened by `TracedInterceptor` (see `interceptor.ts`).
 */
import '@tsmetadata/polyfill';
import { annotationOf } from '@ndigo/core';
import { tracedSpan } from './interceptor';

/**
 * Retrieves the span name declared for a traced method.
 *
 * Walks the class hierarchy, so an inherited declaration resolves.
 *
 * @param target - The target object, its prototype, or the class.
 * @param propertyKey - The method name.
 * @returns The span name, or `undefined` when the method is not traced.
 *
 * @example
 * ```ts
 * getTraced(instance, 'load'); // 'catalog.load'
 * ```
 */
export function getTraced(target: object, propertyKey: string | symbol): string | undefined {
    return annotationOf(target, tracedSpan, propertyKey);
}

/**
 * Whether a method carries a `@traced` declaration.
 *
 * @param target - The target object, its prototype, or the class.
 * @param propertyKey - The method name.
 * @returns `true` when the method is traced.
 */
export function hasTraced(target: object, propertyKey: string | symbol): boolean {
    return getTraced(target, propertyKey) !== undefined;
}

/**
 * Declares that a method runs inside an OpenTelemetry span.
 *
 * Records the span name (the method name when omitted) and returns the method
 * unchanged. A decorated method is inert on its own: `new Service().run()`
 * runs unspanned until the instance is advised, through `interceptMethods` or
 * the container's `interception(...)` processor.
 *
 * @param nameOrTarget - The span name, or the method when used bare.
 * @param maybeContext - The decorator context supplied by the compiler.
 * @returns A method decorator, or the method unchanged.
 * @throws When applied to anything other than a method.
 *
 * @example
 * ```ts
 * class CatalogService {
 *     @traced()
 *     load(id: string): Promise<unknown> {}
 *
 *     @traced('catalog.search')
 *     search(term: string): unknown {}
 * }
 * ```
 */
export function traced(
    nameOrTarget?: string | Function,
    maybeContext?: ClassMethodDecoratorContext
    // The dual form (@traced bare applies directly; @traced(...) returns a
    // replacement decorator) has no single precise type: TS requires the bare
    // form's return to be `void | Method`, and the factory form's result to be
    // the decorator — only `any` satisfies both call shapes.
    // oxlint-disable-next-line no-explicit-any -- untypeable dual-form decorator
): any {
    const declare = (spanName?: string) =>
        function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
            if (context.kind !== 'method') {
                throw new TypeError('@traced can only be applied to methods');
            }
            return tracedSpan(spanName ?? String(context.name))(target, context);
        };

    if (typeof nameOrTarget === 'string') {
        return declare(nameOrTarget);
    }

    if (typeof maybeContext === 'object' && maybeContext !== null) {
        return declare()(nameOrTarget as Function, maybeContext);
    }

    return declare();
}
