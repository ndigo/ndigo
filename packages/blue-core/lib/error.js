/**
 * @author Jeff Rose
 */
import { createNull } from './null';
const { setPrototypeOf } = Reflect;
export const AsSerializableError = (superclass) => class extends superclass {
    toJSON() {
        const json = createNull();
        json.name = this.name;
        json.message = this.message;
        json.stack = this.stack;
        return json;
    }
    toString() {
        return this.message;
    }
};
export class ApplicationError extends AsSerializableError(Error) {
    get [Symbol.toStringTag]() {
        return 'ApplicationError';
    }
    constructor(message) {
        super(message);
        this.name = 'ApplicationError';
        setPrototypeOf(this, new.target.prototype);
    }
}
export class FrameworkError extends AsSerializableError(Error) {
    get [Symbol.toStringTag]() {
        return 'FrameworkError';
    }
    constructor(message) {
        super(message);
        this.name = 'FrameworkError';
        setPrototypeOf(this, new.target.prototype);
    }
}
/**
 * @class module:core.IllegalStateError
 * @extends module:core.FrameworkError
 */
export class IllegalStateError extends FrameworkError {
    get [Symbol.toStringTag]() {
        return 'IllegalStateError';
    }
    constructor(message = 'Unable to complete operation due to misconfiguration') {
        super(message);
    }
}
/**
 * * Developer Notes
 * This is the beginning of an error and exception strategy but I am not sure what error subclasses should exist yet. There should likely be a
 * DomainError subclass declared in the blue-domain package. Having these different classes could help provide ways of managing errors in the
 * ErrorHandler class in blue-dispatcher.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBR3BDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBaUMsVUFBYSxFQUFtQyxFQUFFLENBQ2xILEtBQU0sU0FBUSxVQUFVO0lBQ3BCLE1BQU07UUFDRixNQUFNLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0NBQ0osQ0FBQztBQUVOLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7SUFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxrQkFBa0IsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBWSxPQUFnQjtRQUN4QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDO1FBQy9CLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sY0FBZSxTQUFRLG1CQUFtQixDQUFDLEtBQUssQ0FBQztJQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFFRCxZQUFZLE9BQWdCO1FBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7UUFDN0IsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxjQUFjO0lBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztJQUVELFlBQVksVUFBa0Isc0RBQXNEO1FBQ2hGLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUFFRDs7Ozs7R0FLRyJ9