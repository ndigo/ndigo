/**
 * @author Jeff Rose
 * @module object
 */
import { assoc, assocPath, bind, clone, dissoc, dissocPath, eqProps, evolve, forEachObjIndexed, has, hasIn, hasPath, invert, invertObj, keys, keysIn, lens, lensIndex, lensPath, lensProp, mapObjIndexed, mergeDeepLeft, mergeDeepRight, mergeDeepWith, mergeDeepWithKey, mergeLeft, mergeRight, mergeWith, mergeWithKey, objOf, omit, over, path, pathOr, pick, pickAll, pickBy, project, prop, propOr, props, set, toPairs, toPairsIn, values, valuesIn, view, where, whereAny, whereEq, } from 'ramda';
/** @category Object */
export { assoc };
/** @category Object */
export { assocPath };
/** @category Function @category Object */
export { bind };
/** @category Object */
export { clone };
/** @category Object */
export { dissoc };
/** @category Object */
export { dissocPath };
/** @category Object */
export { eqProps };
/** @category Object */
export { evolve };
/** @category Object */
export { forEachObjIndexed };
/** @category Object */
export { has };
/** @category Object */
export { hasIn };
/** @category Object */
export { hasPath };
/** @category Object */
export { invert };
/** @category Object */
export { invertObj };
/** @category Object */
export { keys };
/** @category Object */
export { keysIn };
/** @category Object */
export { lens };
/** @category Object */
export { lensIndex };
/** @category Object */
export { lensPath };
/** @category Object */
export { lensProp };
/** @category Object */
export { mapObjIndexed };
/** @category Object */
export { mergeDeepLeft };
/** @category Object */
export { mergeDeepRight };
/** @category Object */
export { mergeDeepWith };
/** @category Object */
export { mergeDeepWithKey };
/** @category Object */
export { mergeLeft };
/** @category Object */
export { mergeRight };
/** @category Object */
export { mergeWith };
/** @category Object */
export { mergeWithKey };
/** @category Object */
export { objOf };
/** @category Object */
export { omit };
/** @category Object */
export { over };
/** @category Object */
export { path };
/** @category Object */
export { pathOr };
/** @category Object */
export { pick };
/** @category Object */
export { pickAll };
/** @category Object */
export { pickBy };
/** @category Relation @category Object */
export { project };
/** @category Object */
export { prop };
/** @category Object */
export { propOr };
/** @category Object */
export { props };
/** @category Object */
export { set };
/** @category Object */
export { toPairs };
/** @category Object */
export { toPairsIn };
/** @category Object */
export { values };
/** @category Object */
export { valuesIn };
/** @category Object */
export { view };
/** @category Object */
export { where };
/** @category Object */
export { whereAny };
/** @category Object */
export { whereEq };
export default {
    assoc,
    assocPath,
    bind,
    clone,
    dissoc,
    dissocPath,
    eqProps,
    evolve,
    forEachObjIndexed,
    has,
    hasIn,
    hasPath,
    invert,
    invertObj,
    keys,
    keysIn,
    lens,
    lensIndex,
    lensPath,
    lensProp,
    mapObjIndexed,
    mergeDeepLeft,
    mergeDeepRight,
    mergeDeepWith,
    mergeDeepWithKey,
    mergeLeft,
    mergeRight,
    mergeWith,
    mergeWithKey,
    objOf,
    omit,
    over,
    path,
    pathOr,
    pick,
    pickAll,
    pickBy,
    project,
    prop,
    propOr,
    props,
    set,
    toPairs,
    toPairsIn,
    values,
    valuesIn,
    view,
    where,
    whereAny,
    whereEq,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb2JqZWN0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFDSCxLQUFLLEVBQ0wsU0FBUyxFQUNULElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLFVBQVUsRUFDVixPQUFPLEVBQ1AsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixHQUFHLEVBQ0gsS0FBSyxFQUNMLE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULElBQUksRUFDSixNQUFNLEVBQ04sSUFBSSxFQUNKLFNBQVMsRUFDVCxRQUFRLEVBQ1IsUUFBUSxFQUNSLGFBQWEsRUFDYixhQUFhLEVBQ2IsY0FBYyxFQUNkLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsU0FBUyxFQUNULFVBQVUsRUFDVixTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFDTCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxNQUFNLEVBQ04sT0FBTyxFQUNQLElBQUksRUFDSixNQUFNLEVBQ04sS0FBSyxFQUNMLEdBQUcsRUFDSCxPQUFPLEVBQ1AsU0FBUyxFQUNULE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxFQUNKLEtBQUssRUFDTCxRQUFRLEVBQ1IsT0FBTyxHQUNWLE1BQU0sT0FBTyxDQUFDO0FBRWYsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNqQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLDBDQUEwQztBQUMxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNqQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDdEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUNuQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztBQUM3Qix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2YsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNqQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ25CLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDbEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNyQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDbEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNoQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7QUFDcEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNwQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDO0FBQ3pCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsYUFBYSxFQUFFLENBQUM7QUFDekIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQztBQUMxQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDO0FBQ3pCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztBQUM1Qix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDdEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNyQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDO0FBQ3hCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDakIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNoQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNsQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDbkIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNsQiwwQ0FBMEM7QUFDMUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ25CLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNsQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ2pCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDZix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ25CLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDckIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNsQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ3BCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNqQix1QkFBdUI7QUFDdkIsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ3BCLHVCQUF1QjtBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFFbkIsZUFBZTtJQUNYLEtBQUs7SUFDTCxTQUFTO0lBQ1QsSUFBSTtJQUNKLEtBQUs7SUFDTCxNQUFNO0lBQ04sVUFBVTtJQUNWLE9BQU87SUFDUCxNQUFNO0lBQ04saUJBQWlCO0lBQ2pCLEdBQUc7SUFDSCxLQUFLO0lBQ0wsT0FBTztJQUNQLE1BQU07SUFDTixTQUFTO0lBQ1QsSUFBSTtJQUNKLE1BQU07SUFDTixJQUFJO0lBQ0osU0FBUztJQUNULFFBQVE7SUFDUixRQUFRO0lBQ1IsYUFBYTtJQUNiLGFBQWE7SUFDYixjQUFjO0lBQ2QsYUFBYTtJQUNiLGdCQUFnQjtJQUNoQixTQUFTO0lBQ1QsVUFBVTtJQUNWLFNBQVM7SUFDVCxZQUFZO0lBQ1osS0FBSztJQUNMLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLE1BQU07SUFDTixJQUFJO0lBQ0osT0FBTztJQUNQLE1BQU07SUFDTixPQUFPO0lBQ1AsSUFBSTtJQUNKLE1BQU07SUFDTixLQUFLO0lBQ0wsR0FBRztJQUNILE9BQU87SUFDUCxTQUFTO0lBQ1QsTUFBTTtJQUNOLFFBQVE7SUFDUixJQUFJO0lBQ0osS0FBSztJQUNMLFFBQVE7SUFDUixPQUFPO0NBQ1YsQ0FBQyJ9