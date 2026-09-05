/**
 * @author Jeff Rose
 */

import { BasicModel } from '@blue/model';

const withinRange = (min: number, max: number) => (value: number) => value >= min && value <= max,
    lengthWithinRange = (min: number, max: number) => (value: { length: number }) =>
        withinRange(min, max)(value.length),
    matchesOneOrMore = (pattern: string) => new RegExp(`[${pattern}]+`).test as any,
    matchesOnly = (pattern: string) => new RegExp(`^[${pattern}]+$`).test as any,
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
    .assert((value) => isOnlyAlphaNumeric(value) && lengthWithinRange(8, 16)(value))
    .as('AccountNumber');
export const AccountMaskNumber: any = BasicModel(String)
    .assert((value) => isOnlyAlphaNumeric(value) && lengthWithinRange(7, Number.MAX_SAFE_INTEGER)(value))
    .as('AccountMaskNumber');
export const AlertsProfileNickname: any = BasicModel(String)
    .assert(isOneOrMoreAlphaNumericOrUnderscore)
    .as('AlertsProfileNickname');
//export const Category = BasicModel( String ).assert(  ).as( 'Category' );
