const { defineProperty, setPrototypeOf } = Reflect;
export class ValidationError extends Error {
    cause;
    get [Symbol.toStringTag]() {
        return 'ValidationError';
    }
    constructor(message, cause = null) {
        super(`Validation failed: "${message}"`);
        setPrototypeOf(this, new.target.prototype);
        defineProperty(this, 'cause', {
            value: cause,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
export class ConstraintViolationError extends ValidationError {
    get [Symbol.toStringTag]() {
        return 'ConstraintViolationError';
    }
    constructor(message, violations) {
        super(message);
        defineProperty(this, 'violations', {
            value: violations,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsS0FBSztJQUN0QyxLQUFLLENBQVE7SUFFYixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGlCQUFpQixDQUFDO0lBQzdCLENBQUM7SUFFRCxZQUFZLE9BQWUsRUFBRSxRQUFlLElBQUk7UUFDNUMsS0FBSyxDQUFDLHVCQUF1QixPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRXpDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxlQUFlO0lBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sMEJBQTBCLENBQUM7SUFDdEMsQ0FBQztJQUVELFlBQVksT0FBZSxFQUFFLFVBQXVCO1FBQ2hELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLGNBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQy9CLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSiJ9