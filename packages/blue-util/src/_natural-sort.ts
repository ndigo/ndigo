import { comparator, sort } from 'ramda';

// @ts-expect-error - comparator is typed as any in our ramda.d.ts
export const naturalComparator = comparator<any>((a, b): boolean => a < b);
export const naturalSort = sort(naturalComparator);
