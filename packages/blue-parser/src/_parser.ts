/**
 * @author Jeff Rose
 */
// @ts-ignore
import { anyChar, char } from 'arcsecond';
import manyN from './many-n';
import { joinOnEmptyString } from './_util';

export const asterisk = char('*');

export const atLeastOne = manyN(1);

export const bindRegExp = (value: string) => `^${value}$`;

export const optional = manyN(0);

export const anyString = optional(anyChar).map(joinOnEmptyString);

export const plusSign = char('+');

export const exclamationPoint = char('!');

export const leftBracket = char('[');

export const rightBracket = char(']');
