/**
 * @author Jeff Rose
 */
import { wildcardExpression } from '@blue/parser';
/**
 * @extends external:RegExp
 * @param {string} pattern A wildcard pattern
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lsZGNhcmQtZXhwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3dpbGRjYXJkLWV4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVsRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVksU0FBUSxNQUFNO0lBQzNDLFlBQVksVUFBa0IsR0FBRztRQUM3QixNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2QixzREFBc0Q7WUFDdEQsS0FBSyxDQUFFLFdBQTRFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEcsQ0FBQzthQUFNLENBQUM7WUFDSixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==