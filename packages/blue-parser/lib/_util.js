/**
 * @author Jeff Rose
 */
// @ts-ignore - Module resolution issue with monorepo paths
import { __ } from '@blue/util/function';
import { join } from '@blue/util/list';
import { lt } from '@blue/util/relation';
import { propSatisfies } from 'ramda';
import list from '@blue/util/list';
// @ts-ignore - Module resolution issue with monorepo paths
export { always, comparator, compose, curryN, identity, of, pipe, T } from '@blue/util/function';
export { filter, flatten, head, join, last, length, map, sort } from '@blue/util/list';
export { both, complement, cond, defaultTo, either, ifElse, isEmpty, when } from '@blue/util/logic';
export { forEachObjIndexed, keys, prop } from '@blue/util/object';
export { equals, lt } from '@blue/util/relation';
export { decodeURIComponent, encodeURIComponent, replace, split, test, trailingSplit } from '@blue/util/string';
export { isNil, isString } from '@blue/util/types';
export { propSatisfies } from 'ramda';
// Export custom list functions from default export
export const rangeN = list.rangeN;
export const trailingJoin = list.trailingJoin;
export const xprod = list.xprod;
export const joinOnEmptyString = join('');
export const lengthLessThanN = (n) => propSatisfies(lt(__, n), 'length');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCwyREFBMkQ7QUFDM0QsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUN0QyxPQUFPLElBQUksTUFBTSxpQkFBaUIsQ0FBQztBQUVuQywyREFBMkQ7QUFDM0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDcEcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoSCxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFdEMsbURBQW1EO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQzlDLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBRWhDLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUUxQyxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDIn0=