/**
 * @author Jeff Rose
 */

import { both, complement, is, isNil, propSatisfies } from '@blue/util';

export * from '@blue/util';

export const isDefined = complement( isNil );

export const isFunction = is( Function ) as ( value ) => value is Function;

export const hasFunction: ( prop: string ) => ( value ) => boolean = propSatisfies( isFunction );

export const isDefinedAnd: ( predicate ) => ( value ) => boolean = both( isDefined );
