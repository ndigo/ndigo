/**
 * @author Jeff Rose
 */
export class CompositeConstraint {
    constraints;
    constructor(constraints) {
        if (!constraints.length) {
            throw new Error('"constraints" cannot be empty');
        }
        Reflect.defineProperty(this, 'constraints', {
            value: constraints,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    validate(params, value) {
        let valid = false, violations = [];
        const constraints = this.constraints, validateConstraint = (constraint) => {
            const result = constraint.validate(params, value);
            if (!result) {
                violations.push(constraint);
            }
            return result;
        };
        if (Array.isArray(constraints) && constraints.length) {
            valid =
                constraints.length === 1 ? validateConstraint(constraints[0]) : constraints.every(validateConstraint);
        }
        return valid;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RyYWludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdHJhaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBc0JILE1BQU0sT0FBTyxtQkFBbUI7SUFDNUIsV0FBVyxDQUFrQjtJQUU3QixZQUFZLFdBQTRCO1FBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDeEMsS0FBSyxFQUFFLFdBQVc7WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFFBQVEsQ0FBQyxNQUFjLEVBQUUsS0FBUTtRQUM3QixJQUFJLEtBQUssR0FBRyxLQUFLLEVBQ2IsVUFBVSxHQUFvQixFQUFFLENBQUM7UUFFckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFDaEMsa0JBQWtCLEdBQUcsQ0FBQyxVQUF5QixFQUFXLEVBQUU7WUFDeEQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNWLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsQ0FBQztZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUMsQ0FBQztRQUVOLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkQsS0FBSztnQkFDRCxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM5RyxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKIn0=