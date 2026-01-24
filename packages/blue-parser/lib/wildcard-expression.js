/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 */
import { head, pipe, replace } from './_util';
import { anyString, asterisk, bindRegExp } from './_parser';
import sepByN from './sep-by-n';
const replaceAstrisk = replace(/\*/g, '.*?');
const wildcardExpression = sepByN(0)(asterisk)(anyString).map(pipe(head, replaceAstrisk, bindRegExp));
export default wildcardExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lsZGNhcmQtZXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy93aWxkY2FyZC1leHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDNUQsT0FBTyxNQUFNLE1BQU0sWUFBWSxDQUFDO0FBRWhDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFN0MsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFFdEcsZUFBZSxrQkFBa0IsQ0FBQyJ9