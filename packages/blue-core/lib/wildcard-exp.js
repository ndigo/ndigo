/**
 * @author Jeff Rose
 */
import { wildcardExpression } from '@blue/parser';
/**
 * @class module:core.WildcardExp
 * @extends external:RegExp
 * @param {external:string} pattern A wildcard pattern
 */
export default class WildcardExp extends RegExp {
    constructor(pattern = '*') {
        const regExpPattern = wildcardExpression.run(pattern).result;
        super(regExpPattern);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lsZGNhcmQtZXhwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3dpbGRjYXJkLWV4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVsRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFZLFNBQVEsTUFBTTtJQUMzQyxZQUFZLFVBQWtCLEdBQUc7UUFDN0IsTUFBTSxhQUFhLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM3RCxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekIsQ0FBQztDQUNKIn0=