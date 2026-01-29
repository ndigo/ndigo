/**
 * @author Jeff Rose
 */
import { always, identity, pipe, T } from '@blue/util/function';
import { cond, ifElse } from '@blue/util/logic';
import { isNumber, isString } from '@blue/util/types';
import { numberComparator } from './comparable';
const { isNaN } = Number, alwaysOne = always(parseFloat('1.0'));
export const parseQualityFactor = cond([
    [isString, pipe(parseFloat, ifElse(isNaN, alwaysOne, identity))],
    [isNumber, identity],
    [T, alwaysOne],
]);
/**
 * @implements module:core.Comparator
 */
class QualityFactorComparator {
    compare(q1, q2) {
        const quality1 = parseQualityFactor(q1.qualityFactor), quality2 = parseQualityFactor(q2.qualityFactor);
        return numberComparator.compare(quality2, quality1);
    }
}
export const qualityFactorComparator = new QualityFactorComparator();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVhbGl0eS1mYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVhbGl0eS1mYWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RELE9BQU8sRUFBYyxnQkFBZ0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQWE1RCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxFQUNwQixTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQztDQUNqQixDQUFDLENBQUM7QUFFSDs7R0FFRztBQUNILE1BQU0sdUJBQXVCO0lBQ3pCLE9BQU8sQ0FBQyxFQUFlLEVBQUUsRUFBZTtRQUNwQyxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFXLEVBQzNELFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFXLENBQUM7UUFDOUQsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQyJ9