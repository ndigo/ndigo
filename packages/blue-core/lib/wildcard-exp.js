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
        const parseResult = wildcardExpression.run(pattern);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<string, any> here
            super(parseResult.result);
        }
        else {
            throw new Error(`Failed to parse wildcard pattern: ${pattern}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lsZGNhcmQtZXhwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3dpbGRjYXJkLWV4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVsRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFZLFNBQVEsTUFBTTtJQUMzQyxZQUFZLFVBQWtCLEdBQUc7UUFDN0IsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkIsc0RBQXNEO1lBQ3RELEtBQUssQ0FBRSxXQUE0RSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hHLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRSxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=