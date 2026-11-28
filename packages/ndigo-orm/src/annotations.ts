/**
 * `@transactional` annotation and its interceptor.
 */
import '@tsmetadata/polyfill';
import { methodAnnotation, type MethodAnnotationKey } from '@ndigo/core';
import { AdviceOrder, type MethodInterceptor, type MethodInvocation } from '@ndigo/advice';
import type { TransactionManager } from './transaction-manager';
import { TRANSACTIONAL_METADATA_KEY } from './_constants';

/**
 * `@transactional` annotation key. A method carrying it runs inside a
 * transaction when its instance exposes a `transactionManager`.
 *
 * @example
 * ```ts
 * rules.add({ when: hasAnnotation(transactionalMethod), use: new TransactionalInterceptor() });
 * ```
 */
export const transactionalMethod: MethodAnnotationKey<true> = methodAnnotation<true>(TRANSACTIONAL_METADATA_KEY);

/**
 * Declares that a method runs inside a transaction.
 *
 * Records the declaration and returns the method unchanged — the boundary is
 * opened by {@link TransactionalInterceptor}, not by the decorator. A
 * decorated method is inert on its own: `new Service().run()` runs outside
 * any transaction until the instance is advised.
 *
 * @returns The method decorator.
 * @throws When applied to anything other than a method.
 *
 * @example
 * ```ts
 * class OrderService {
 *     constructor(readonly transactionManager: TransactionManager) {}
 *
 *     @transactional()
 *     async place(order: Order): Promise<void> {}
 * }
 * ```
 */
export function transactional() {
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        if (context.kind !== 'method') {
            throw new TypeError(`@transactional can only be applied to a method — received '${context.kind}'.`);
        }
        return transactionalMethod(true)(target, context);
    };
}

/**
 * Runs `@transactional` methods inside a transaction.
 *
 * The interceptor is reentrancy-aware: a transactional method that calls
 * another transactional method joins the open transaction instead of opening
 * a second one. Nested boundaries cannot work otherwise — both transaction
 * managers reject an already-active transaction, and a nested attempt would
 * throw exactly where the caller expected a working composite operation.
 *
 * Joining is tracked per manager, so two independent services with their own
 * managers do not mask each other's boundaries.
 *
 * The interceptor is async because a transaction boundary is: it must await
 * the body to know whether to commit or roll back. A `@transactional` method
 * therefore returns a promise even when its declared type is not one.
 *
 * @example
 * ```ts
 * class OrderService {
 *     constructor(readonly transactionManager: TransactionManager) {}
 *
 *     @transactional()
 *     async place(order: Order): Promise<void> {}
 * }
 *
 * const service = interceptMethods(
 *     new OrderService(tx),
 *     [{ when: hasAnnotation(transactional), use: new TransactionalInterceptor() }]
 * );
 * ```
 */
export class TransactionalInterceptor implements MethodInterceptor {
    /**
     * The transaction band: inside resilience, so a retry starts a fresh
     * transaction per attempt rather than retrying inside one boundary.
     */
    readonly order = AdviceOrder.Transaction;

    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "TransactionalInterceptor".
     */
    get [Symbol.toStringTag](): string {
        return 'TransactionalInterceptor';
    }

    /** Open-boundary depth per manager, so nesting joins instead of throwing. */
    readonly #depth = new WeakMap<TransactionManager, number>();

    /**
     * Opens a transaction around the call, or joins the one already open on
     * the instance's manager.
     *
     * An instance without a `transactionManager` degrades to a plain call —
     * useful in unit tests that do not need real boundaries.
     *
     * @param invocation - The advised call.
     * @param next - Continues the inner chain and runs the method.
     * @returns The call result, resolved inside the boundary.
     */
    async invoke(invocation: MethodInvocation, next: () => unknown): Promise<unknown> {
        const manager = (invocation.target as { transactionManager?: TransactionManager }).transactionManager;
        if (manager === undefined) {
            return next();
        }

        const open = this.#depth.get(manager) ?? 0;
        if (open > 0) {
            // Joined: the outermost boundary decides commit or rollback.
            this.#depth.set(manager, open + 1);
            try {
                return await next();
            } finally {
                this.#depth.set(manager, open);
            }
        }

        this.#depth.set(manager, 1);
        try {
            return await manager.run(() => next());
        } finally {
            this.#depth.set(manager, 0);
        }
    }
}
