/**
 * @author Jeff Rose
 */

import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route, PathRoute, RouteTransactionManager, RouteTransactionStatus } from '@blue/router';

/**
 * Wraps route handler execution in a transaction.
 */
export class TransactionRouteHandlerInterceptor implements RouteHandlerInterceptor {
    /**
     * Transaction manager used to create, commit, and roll back route transactions.
     */
    #transactionManager: RouteTransactionManager;

    /**
     * Transaction status tracked per route.
     */
    #statusMap: WeakMap<Route, RouteTransactionStatus>;

    /**
     * Create a transaction interceptor.
     *
     * @param transactionManager - The transaction manager to use.
     */
    constructor(transactionManager: RouteTransactionManager) {
        this.#transactionManager = transactionManager;
        this.#statusMap = new WeakMap();
    }

    /**
     * Start a transaction before the route handler executes.
     *
     * @param route - The current route.
     * @param handler - The route handler.
     * @returns `true` to continue execution.
     */
    async preHandle(route: Route, handler: any): Promise<boolean> {
        if (route instanceof PathRoute) {
            // We assume syncHash=true for handler-level transactions
            const hash = typeof location !== 'undefined' ? location.hash : '';
            const status = this.#transactionManager.getTransaction(route, hash, true);
            this.#statusMap.set(route, status);
        }
        return true;
    }

    /**
     * Commit the transaction after successful handler execution.
     *
     * @param route - The current route.
     * @param handler - The route handler.
     * @param modelAndView - The model and view returned by the handler.
     */
    async postHandle(route: Route, handler: any, modelAndView: ModelAndView): Promise<void> {
        const status = this.#statusMap.get(route);
        if (status) {
            this.#transactionManager.commit(status);
        }
    }

    /**
     * Roll back the transaction when handler execution fails.
     *
     * @param route - The current route.
     * @param handler - The route handler.
     * @param error - The error thrown during execution.
     */
    async completeHandle(route: Route, handler: any, error: Error): Promise<void> {
        const status = this.#statusMap.get(route);
        if (status) {
            if (error) {
                status.setRollbackOnly();
                this.#transactionManager.rollback(status);
            }
            this.#statusMap.delete(route);
        }
    }
}
