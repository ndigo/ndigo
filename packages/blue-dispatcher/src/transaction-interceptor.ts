/**
 * @author Jeff Rose
 */

import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route, PathRoute, RouteTransactionManager, RouteTransactionStatus } from '@blue/router';

/**
 * A standard interceptor that wraps route handler execution in a transaction.
 * If the handler throws an error, the transaction is rolled back (reverting the browser hash).
 * If the handler succeeds, the transaction is committed.
 */
export class TransactionRouteHandlerInterceptor implements RouteHandlerInterceptor {
    #transactionManager: RouteTransactionManager;
    #statusMap: WeakMap<Route, RouteTransactionStatus>;

    constructor(transactionManager: RouteTransactionManager) {
        this.#transactionManager = transactionManager;
        this.#statusMap = new WeakMap();
    }

    async preHandle(route: Route, handler: any): Promise<boolean> {
        if (route instanceof PathRoute) {
            // We assume syncHash=true for handler-level transactions
            const status = this.#transactionManager.getTransaction(route, location.hash, true);
            this.#statusMap.set(route, status);
        }
        return true;
    }

    async postHandle(route: Route, handler: any, modelAndView: ModelAndView): Promise<void> {
        const status = this.#statusMap.get(route);
        if (status) {
            this.#transactionManager.commit(status);
        }
    }

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
