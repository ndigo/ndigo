/**
 * @author Jeff Rose
 */
export * from '@blue/util';
export declare const isDefined: <T>(value: T) => value is Exclude<T, null>;
export declare const isFunction: (value: any) => value is Function;
export declare const hasFunction: (prop: string) => (value: any) => boolean;
export declare const isDefinedAnd: (predicate: any) => (value: any) => boolean;
//# sourceMappingURL=_util.d.ts.map