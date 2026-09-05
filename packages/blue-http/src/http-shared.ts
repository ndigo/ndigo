/**
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import type { WildcardExp } from '@blue/core';
import type { HTTPInit } from './http-types';
import { is } from '@blue/util/types';

/**
 * Shared \`Object\` helpers used to clone and freeze request settings.
 */
/**
 * Clones request settings and locks them before fetch executes.
 */
export const { assign, freeze } = Object,
    { defineProperty } = Reflect,
    defaults: HTTPInit = {
        cache: 'default',
        credentials: 'same-origin',
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
    },
    patternCache = new Map<string, WildcardExp>(),
    isRequest = is(Request) as (value: any) => value is Request;

