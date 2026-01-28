export class AbstractTransactionStatus {
    isCompleted;
    isGlobalRollbackOnly;
    isLocalRollbackOnly;
    isRollbackOnly;
    isNewTransaction;
    savepoint;
    hasSavepoint() {
        throw new Error('Method not implemented.');
    }
    createSavepoint() {
        throw new Error('Method not implemented.');
    }
    releaseSavepoint(savepoint) {
        throw new Error('Method not implemented.');
    }
    rollbackToSavepoint(savepoint) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24tbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90cmFuc2FjdGlvbi1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXNCQSxNQUFNLE9BQWdCLHlCQUF5QjtJQUMzQyxXQUFXLENBQVU7SUFDckIsb0JBQW9CLENBQVU7SUFDOUIsbUJBQW1CLENBQVU7SUFDN0IsY0FBYyxDQUFVO0lBQ3hCLGdCQUFnQixDQUFVO0lBRTFCLFNBQVMsQ0FBQztJQUVWLFlBQVk7UUFDUixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELGVBQWU7UUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELGdCQUFnQixDQUFDLFNBQWM7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxTQUFjO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0oifQ==