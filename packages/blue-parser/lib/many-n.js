/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcseconds}
 */
// @ts-ignore
import { fail, many, succeedWith } from 'arcsecond';
import { ifElse, lengthLessThanN } from './_util';
const failWith = (n) => ({ index }) => fail(`ParseError 'manyN' (position ${index}): Expecting to match at least ${n} value${n > 1 ? 's' : ''}`), manyN = (n) => (parser) => many(parser).chain(ifElse(lengthLessThanN(n), failWith(n), succeedWith));
export default manyN;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFueS1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hbnktbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxhQUFhO0FBQ2IsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQVUsV0FBVyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzVELE9BQU8sRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWxELE1BQU0sUUFBUSxHQUNOLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FDZCxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUNWLElBQUksQ0FBQyxnQ0FBZ0MsS0FBSyxrQ0FBa0MsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDakgsS0FBSyxHQUNELENBQUksQ0FBUyxFQUFFLEVBQUUsQ0FDakIsQ0FBQyxNQUFpQixFQUFhLEVBQUUsQ0FDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBRXJGLGVBQWUsS0FBSyxDQUFDIn0=