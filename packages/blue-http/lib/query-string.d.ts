/**
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier } from '@blue/core';
declare class QueryString implements Parser, Stringifier {
    parse(value: string): JSONObject;
    stringify(value: any): string;
}
declare const _default: QueryString;
export default _default;
//# sourceMappingURL=query-string.d.ts.map