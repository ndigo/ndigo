/**
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier } from '@blue/core';
import queryExpression from './parsers/query-expression';
import { encodeURIComponent as encode } from '@blue/util/string';

const arrayStringifier = (key: string, value: string, index?: number): string =>
        value === null ? encode(key) : `${encode(key)}=${encode(value)}`,
    toQueryString = (object: any): string =>
        object
            ? Object.keys(object)
                  .sort()
                  .map(function (key: string): string {
                      const value = object[key];

                      if (value === undefined) {
                          return '';
                      }

                      if (value === null) {
                          return encode(key);
                      }

                      if (Array.isArray(value)) {
                          const result: string[] = [];

                          value.slice().forEach(function (val: string): void {
                              if (val === undefined) {
                                  return;
                              }
                              result.push(arrayStringifier(key, val, result.length));
                          });

                          return result.join('&');
                      }

                      return `${encode(key)}=${encode(value)}`;
                  })
                  .filter((s) => s.length > 0)
                  .join('&')
            : '';

/**
 * Parses and serializes query strings using stable key ordering.
 */
class QueryString implements Parser, Stringifier {
    /**
     * Parses a query string into a JSON object.
     *
     * @param value - The query string to parse.
     * @returns A plain object representation of the query string.
     */
    parse(value: string): JSONObject {
        const parseResult = queryExpression.run(value);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<JSONObject, string> here
            return (parseResult as { isError: false; result: JSONObject; index: number; data: string }).result;
        }
        return {};
    }
    /**
     * Serializes a JSON-like value to a query string.
     *
     * @param value - The value to serialize.
     * @returns The encoded query string.
     */
    stringify(value: any): string {
        return toQueryString(value);
    }
}

/**
 * Query-string parser and serializer singleton.
 */
export default new QueryString();
