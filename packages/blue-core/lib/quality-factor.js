/**
 * @author Jeff Rose
 */
import { always, cond, identity, ifElse, isNumber, isString, pipe, T } from '@blue/util';
import { numberComparator } from './comparable';
const { isNaN } = Number, alwaysOne = always(parseFloat('1.0'));
export const parseQualityFactor = cond([
    [isString, pipe(parseFloat, ifElse(isNaN, alwaysOne, identity))],
    [isNumber, identity],
    [T, alwaysOne],
]);
/**
 * @class module:core~QualityFactorComparator
 * @implements module:core.Comparator
 */
class QualityFactorComparator {
    compare(q1, q2) {
        const quality1 = parseQualityFactor(q1.qualityFactor), quality2 = parseQualityFactor(q2.qualityFactor);
        return numberComparator.compare(quality2, quality1);
    }
}
export const qualityFactorComparator = new QualityFactorComparator();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVhbGl0eS1mYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVhbGl0eS1mYWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN6RixPQUFPLEVBQWMsZ0JBQWdCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFhNUQsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sRUFDcEIsU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUUxQyxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFDbkMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQUMsRUFBRSxTQUFTLENBQUM7Q0FDakIsQ0FBQyxDQUFDO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSx1QkFBdUI7SUFDekIsT0FBTyxDQUFDLEVBQWUsRUFBRSxFQUFlO1FBQ3BDLE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQVcsRUFDM0QsUUFBUSxHQUFHLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQVcsQ0FBQztRQUM5RCxPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEQsQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSx1QkFBdUIsRUFBRSxDQUFDIn0=