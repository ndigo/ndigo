// Type declarations for feature detection of non-standard and proposed APIs
declare global {
    interface Navigator {
        connection?: any;
        keyboard?: any;
    }
    
    interface Document {
        requestPointerLock?: () => void;
    }
    
    interface VisualViewport {
        segments?: any;
    }
    
    interface Function {
        isGenerator?: boolean;
        toSource?: () => string;
    }
    
    interface Date {
        toLocaleFormat?: (format: string) => string;
    }
    
    interface String {
        createHTML?: () => string;
    }
    
    interface Iterator<T> {
        asIndexedPairs?: () => Iterator<[number, T]>;
    }
    
    namespace Intl {
        interface PluralRulesConstructor {
            select?: (n: number) => string;
        }
    }
    
    namespace Reflect {
        function getOwnMetadataKeys(target: any): any[];
    }
    
    interface WeakMap<K extends WeakKey, V> {
        emplace?: (key: K, handler: any) => V;
    }
    
    interface TypedArray {
        filterOut?: (predicate: (value: number) => boolean) => this;
    }
    
    interface BigInt64Array extends TypedArray {}
    interface BigUint64Array extends TypedArray {}
    interface Float32Array extends TypedArray {}
    interface Float64Array extends TypedArray {}
    interface Int8Array extends TypedArray {}
    interface Int16Array extends TypedArray {}
    interface Int32Array extends TypedArray {}
    interface Uint8Array extends TypedArray {}
    interface Uint16Array extends TypedArray {}
    interface Uint32Array extends TypedArray {}
}

export {};
