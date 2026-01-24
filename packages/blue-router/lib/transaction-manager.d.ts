export interface SavepointManager {
    createSavepoint(): any;
    releaseSavepoint(savepoint: any): any;
    rollbackToSavepoint(savepoint: any): any;
}
export interface TransactionExecution {
    isCompleted: boolean;
    isRollbackOnly: boolean;
    isNewTransaction: boolean;
}
export interface TransactionManager {
    commit(status: any): any;
    getTransaction(definition: any): any;
    rollback(status: any): any;
}
export interface TransactionStatus extends SavepointManager, TransactionExecution {
    hasSavepoint(): boolean;
}
export declare abstract class AbstractTransactionStatus implements TransactionStatus {
    isCompleted: boolean;
    isGlobalRollbackOnly: boolean;
    isLocalRollbackOnly: boolean;
    isRollbackOnly: boolean;
    isNewTransaction: boolean;
    savepoint: any;
    hasSavepoint(): boolean;
    createSavepoint(): void;
    releaseSavepoint(savepoint: any): void;
    rollbackToSavepoint(savepoint: any): void;
}
//# sourceMappingURL=transaction-manager.d.ts.map