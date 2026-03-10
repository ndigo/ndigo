import { PathRoute } from './path-route';

export interface SavepointManager {
    createSavepoint(): unknown;
    releaseSavepoint(savepoint: unknown): void;
    rollbackToSavepoint(savepoint: unknown): void;
}

export interface RouteTransactionExecution {
    readonly isCompleted: boolean;
    readonly isRollbackOnly: boolean;
    readonly isNewTransaction: boolean;
}

export interface RouteTransactionStatus extends RouteTransactionExecution {
    readonly route: PathRoute;
    readonly previousRoute: string;
    readonly syncHash: boolean;

    setRollbackOnly(): void;
}

export interface RouteTransactionManager {
    commit(status: RouteTransactionStatus): void;
    getTransaction(route: PathRoute, previousRoute: string, syncHash?: boolean): RouteTransactionStatus;
    rollback(status: RouteTransactionStatus): void;
}

export class DefaultRouteTransactionStatus implements RouteTransactionStatus {
    #isCompleted: boolean;
    #isRollbackOnly: boolean;
    #isNewTransaction: boolean;

    readonly previousRoute: string;
    readonly route: PathRoute;
    readonly syncHash: boolean;

    get isCompleted(): boolean {
        return this.#isCompleted;
    }

    get isRollbackOnly(): boolean {
        return this.#isRollbackOnly;
    }

    get isNewTransaction(): boolean {
        return this.#isNewTransaction;
    }

    constructor(route: PathRoute, previousRoute: string, isNewTransaction = true, syncHash = true) {
        this.route = route;
        this.previousRoute = previousRoute;
        this.syncHash = syncHash;
        this.#isCompleted = false;
        this.#isRollbackOnly = false;
        this.#isNewTransaction = isNewTransaction;
    }

    setRollbackOnly(): void {
        this.#isRollbackOnly = true;
    }

    complete(): void {
        this.#isCompleted = true;
    }
}

export class DefaultRouteTransactionManager implements RouteTransactionManager {
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

    getTransaction(route: PathRoute, previousRoute: string, syncHash = true): RouteTransactionStatus {
        return new DefaultRouteTransactionStatus(route, previousRoute, true, syncHash);
    }

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
