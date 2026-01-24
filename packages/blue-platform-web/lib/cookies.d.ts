/**
 * @author Jeff Rose
 */
import { JSONValue } from '@blue/core';
export interface Cookie {
    name: string;
    value: string;
    domain?: string;
    expires?: string;
    maxAge?: string;
    path?: string;
    sameSite?: string;
    secure?: boolean;
}
export interface CookieJar {
    get(key: string): JSONValue;
    getJSON(key: string): JSONValue;
    remove(key: string, attributes: any): string;
    set(key: string, value: string, attributes: any): string;
}
declare const _default: CookieJar;
export default _default;
//# sourceMappingURL=cookies.d.ts.map