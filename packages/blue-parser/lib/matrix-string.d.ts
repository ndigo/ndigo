/**
 * @author Jeff Rose
 */
export type JSONValue = boolean | null | number | string | JSONObject | JSONArray;
export interface JSONObject extends Record<string, JSONValue> {
}
export interface JSONArray extends Array<JSONValue> {
}
export interface Parser<T = any> {
    parse(value: string): T;
}
declare class MatrixString implements Parser<JSONObject> {
    parse(value: string): JSONObject;
}
declare const _default: MatrixString;
export default _default;
//# sourceMappingURL=matrix-string.d.ts.map