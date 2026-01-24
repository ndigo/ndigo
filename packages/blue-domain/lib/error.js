/**
 * @author Jeff Rose
 */
import { AsSerializableError } from '@blue/core';
const { setPrototypeOf } = Reflect;
export class DomainError extends AsSerializableError(Error) {
    get [Symbol.toStringTag]() {
        return 'DomainError';
    }
    constructor(message) {
        super(message);
        setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFakQsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxNQUFNLE9BQU8sV0FBWSxTQUFRLG1CQUFtQixDQUFDLEtBQUssQ0FBQztJQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQsWUFBWSxPQUFnQjtRQUN4QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQztDQUNKIn0=