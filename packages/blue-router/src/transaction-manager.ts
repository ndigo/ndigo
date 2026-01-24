
export interface SavepointManager {
    createSavepoint(): any;
    releaseSavepoint( savepoint );
    rollbackToSavepoint( savepoint );
}

export interface TransactionExecution {
    isCompleted: boolean;
    isRollbackOnly: boolean;
    isNewTransaction: boolean;
}

export interface TransactionManager {
    commit( status );
    getTransaction( definition ): any;
    rollback( status );
}

export interface TransactionStatus extends SavepointManager, TransactionExecution {
    hasSavepoint(): boolean;
}

export abstract class AbstractTransactionStatus implements TransactionStatus {
    isCompleted: boolean;
    isGlobalRollbackOnly: boolean;
    isLocalRollbackOnly: boolean;
    isRollbackOnly: boolean;
    isNewTransaction: boolean;

    savepoint;

    hasSavepoint(): boolean {
        throw new Error( "Method not implemented." );
    }

    createSavepoint(){
        throw new Error( "Method not implemented." );
    }

    releaseSavepoint( savepoint: any ){
        throw new Error( "Method not implemented." );
    }

    rollbackToSavepoint( savepoint: any ){
        throw new Error( "Method not implemented." );
    }
}
