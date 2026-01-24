import { comparator, sort } from 'ramda';

export const naturalComparator = comparator<any>((a, b): boolean => a < b);
export const naturalSort = sort(naturalComparator);
