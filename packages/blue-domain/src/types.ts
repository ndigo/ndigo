/**
 * @author Jeff Rose
 */

import { BasicModel } from '@blue/model';
import { __, allPass, both, constructN, gte, lte, pipe, test } from '@blue/util';

const newRegExp = constructN(1, RegExp),
    only = (pattern: string) => `^${pattern}$`,
    oneOrMore = (pattern: string) => `[${pattern}]+`,
    withinRange = (min, max) => both(gte(__, min), lte(__, max)),
    lengthWithinRange = (min, max) => (value) => withinRange(min, max)(value.length),
    matchesOneOrMore = pipe(oneOrMore, newRegExp, test as any) as any,
    matchesOnly = pipe(oneOrMore, only, newRegExp, test as any) as any,
    ALPHA_PATTERN = 'A-Za-z',
    NUMERIC_PATTERN = '0-9',
    isOneOrMoreAlphaNumericOrUnderscore = matchesOneOrMore(`${ALPHA_PATTERN}${NUMERIC_PATTERN}_`),
    isOnlyAlpha = matchesOnly(ALPHA_PATTERN),
    isOnlyAlphaNumeric = matchesOnly(`${ALPHA_PATTERN}${NUMERIC_PATTERN}`),
    isOnlyNumeric = matchesOnly(NUMERIC_PATTERN);

export const AlphaString: any = BasicModel(String).assert(isOnlyAlpha).as('AlphaString');
export const AlphaNumericString: any = BasicModel(String).assert(isOnlyAlphaNumeric).as('AlphaNumericString');
export const NumericString: any = BasicModel(String).assert(isOnlyNumeric).as('NumericString');
export const AccountNumber: any = BasicModel(String)
    .assert(both(isOnlyAlphaNumeric, lengthWithinRange(8, 16)))
    .as('AccountNumber');
export const AccountMaskNumber: any = BasicModel(String)
    .assert(allPass([isOnlyAlphaNumeric, lengthWithinRange(7, Number.MAX_SAFE_INTEGER)]))
    .as('AccountMaskNumber');
export const AlertsProfileNickname: any = BasicModel(String)
    .assert(isOneOrMoreAlphaNumericOrUnderscore)
    .as('AlertsProfileNickname');
//export const Category = BasicModel( String ).assert(  ).as( 'Category' );
