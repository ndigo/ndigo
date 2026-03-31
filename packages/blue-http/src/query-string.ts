/**
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier } from '@blue/core';
import queryExpression from './parsers/query-expression';
import { isNotEmpty } from '@blue/util/logic';
import { encodeURIComponent as encode } from '@blue/util/string';

const arrayStringifier = (key: string, value: string, index?: number): string =>
        value === null ? encode(key) : `${encode(key)}=${encode(value)}`,
    toQueryString = (object): string =>
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
                  .filter(isNotEmpty)
                  .join('&')
            : '';

class QueryString implements Parser, Stringifier {
    parse(value: string): JSONObject {
        const parseResult = queryExpression.run(value);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<JSONObject, string> here
            return (parseResult as { isError: false; result: JSONObject; index: number; data: string }).result;
        }
        return {};
    }
    stringify(value: any): string {
        return toQueryString(value);
    }
}

export default new QueryString();
