import { PathRoute } from './path-route';

/**
 * Defines an interface for managing savepoints within a transaction, allowing for rollback and release.
 * @since 1.0.0
 */
export interface SavepointManager {
    createSavepoint(): unknown;
    releaseSavepoint(savepoint: unknown): void;
    rollbackToSavepoint(savepoint: unknown): void;
}

/**
 * Defines the execution status of a route transaction.
 * @since 1.0.0
 */
export interface RouteTransactionExecution {
    readonly isCompleted: boolean;
    readonly isRollbackOnly: boolean;
    readonly isNewTransaction: boolean;
}

/**
 * Extends `RouteTransactionExecution` with additional details and actions specific to a route transaction's status.
 * @since 1.0.0
 */
export interface RouteTransactionStatus extends RouteTransactionExecution {
    readonly route: PathRoute;
    readonly previousRoute: string;
    readonly syncHash: boolean;

    setRollbackOnly(): void;
}

/**
 * Defines an interface for managing the lifecycle of route transactions, including committing and rolling back.
 * @since 1.0.0
 */
export interface RouteTransactionManager {
    commit(status: RouteTransactionStatus): void;
    getTransaction(route: PathRoute, previousRoute: string, syncHash?: boolean): RouteTransactionStatus;
    rollback(status: RouteTransactionStatus): void;
}

/**
 * A default implementation of `RouteTransactionStatus` that tracks the state of a route transaction.
 * @since 1.0.0
 */
export class DefaultRouteTransactionStatus implements RouteTransactionStatus {
    #isCompleted: boolean;
    #isRollbackOnly: boolean;
    #isNewTransaction: boolean;

    readonly previousRoute: string;
    readonly route: PathRoute;
    readonly syncHash: boolean;

    /**
     * Indicates whether the transaction has been completed (committed or rolled back).
     * @returns `true` if the transaction is completed, `false` otherwise.
     * @since 1.0.0
     */
    get isCompleted(): boolean {
        return this.#isCompleted;
    }

    /**
     * Indicates whether the transaction is marked for rollback only.
     * @returns `true` if the transaction is rollback-only, `false` otherwise.
     * @since 1.0.0
     */
    get isRollbackOnly(): boolean {
        return this.#isRollbackOnly;
    }

    /**
     * Indicates whether this status object represents a new transaction.
     * @returns `true` if it's a new transaction, `false` otherwise.
     * @since 1.0.0
     */
    get isNewTransaction(): boolean {
        return this.#isNewTransaction;
    }

    /**
     * Creates an instance of `DefaultRouteTransactionStatus`.
     * @param route - The current `PathRoute` for this transaction.
     * @param previousRoute - The previous route string before this transaction.
     * @param isNewTransaction - `true` if this is a new transaction, `false` otherwise. Defaults to `true`.
     * @param syncHash - `true` if the browser hash should be synchronized during rollback, `false` otherwise. Defaults to `true`.
     * @since 1.0.0
     */
    constructor(route: PathRoute, previousRoute: string, isNewTransaction = true, syncHash = true) {
        this.route = route;
        this.previousRoute = previousRoute;
        this.syncHash = syncHash;
        this.#isCompleted = false;
        this.#isRollbackOnly = false;
        this.#isNewTransaction = isNewTransaction;
    }

    /**
     * Marks the current transaction as rollback-only.
     * A rollback-only transaction cannot be committed and will always be rolled back.
     * @since 1.0.0
     */
    setRollbackOnly(): void {
        this.#isRollbackOnly = true;
    }

    /**
     * Marks the transaction as completed.
     * This method is typically called internally by the `RouteTransactionManager`.
     * @since 1.0.0
     */
    complete(): void {
        this.#isCompleted = true;
    }
}

/**
 * A default implementation of `RouteTransactionManager` that handles committing and rolling back route transactions.
 * @since 1.0.0
 */
export class DefaultRouteTransactionManager implements RouteTransactionManager {
    /**
     * Commits the given route transaction.
     * If the transaction is marked as rollback-only, it will be rolled back instead.
     * @param status - The `RouteTransactionStatus` to commit.
     * @since 1.0.0
     */
    commit(status: RouteTransactionStatus): void {
        if (status.isCompleted) {
            return;
        }

        if (status.isRollbackOnly) {
            this.rollback(status);
            return;
        }

        (status as DefaultRouteTransactionStatus).complete();
    }

    /**
     * Creates and returns a new `RouteTransactionStatus` for a given route change.
     * @param route - The new `PathRoute` for the transaction.
     * @param previousRoute - The previous route string before this transaction.
     * @param syncHash - `true` if the browser hash should be synchronized during rollback, `false` otherwise. Defaults to `true`.
     * @returns A new `RouteTransactionStatus` instance.
     * @since 1.0.0
     */
    getTransaction(route: PathRoute, previousRoute: string, syncHash = true): RouteTransactionStatus {
        return new DefaultRouteTransactionStatus(route, previousRoute, true, syncHash);
    }

    /**
     * Rolls back the given route transaction.
     * If `syncHash` is enabled in the transaction status, the browser's hash will be reverted to the `previousRoute`.
     * @param status - The `RouteTransactionStatus` to roll back.
     * @since 1.0.0
     */
    rollback(status: RouteTransactionStatus): void {
        if (status.isCompleted) {
            return;
        }

        (status as DefaultRouteTransactionStatus).complete();

        const oldRoute = status.previousRoute;
        if (status.syncHash && location.hash !== oldRoute) {
            location.hash = oldRoute;
        }
    }
}
