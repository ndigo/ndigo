/**
 * @author Jeff Rose
 * @see external:date-fns
 * @see external:date-fns-tz
 * @see external:ramda
 * @see external:seedrandom
 * @see external:slug
 */
/**
 * @global
 * @external date-fns
 * @see {@link https://date-fns.org/}
 */
/**
 * @global
 * @external date-fns-tz
 * @see {@link https://github.com/marnusw/date-fns-tz}
 */
/**
 * @global
 * @external ramda
 * @see {@link https://ramdajs.com/docs/}
 */
/**
 * @global
 * @external seedrandom
 * @see {@link https://www.npmjs.com/package/seedrandom}
 */
/**
 * @global
 * @external slug
 * @see {@link https://www.npmjs.com/package/slug}
 */
import fn from './function/index.js';
import list from './list/index.js';
import logic from './logic/index.js';
import math from './math/index.js';
import object from './object/index.js';
import relation from './relation/index.js';
import string from './string/index.js';
import types from './type/index.js';
import * as date from './date/index.js';
export { fn, list, logic, math, object, relation, string, types, date };
declare const _default: {
    fn: {
        F: typeof import("ramda").F;
        T: typeof import("ramda").T;
        __: import("ramda").Placeholder;
        addIndex: typeof import("ramda").addIndex;
        addIndexRight: typeof import("ramda").addIndexRight;
        always: typeof import("ramda").always;
        andThen: typeof import("ramda").andThen;
        ap: typeof import("ramda").ap;
        apply: typeof import("ramda").apply;
        applySpec: typeof import("ramda").applySpec;
        applyTo: typeof import("ramda").applyTo;
        ascend: typeof import("ramda").ascend;
        ascendNatural: typeof import("ramda").ascendNatural;
        binary: typeof import("ramda").binary;
        bind: typeof import("ramda").bind;
        call: typeof import("ramda").call;
        comparator: typeof import("ramda").comparator;
        compose: typeof import("ramda").compose;
        composeWith: typeof import("ramda").composeWith;
        construct: typeof import("ramda").construct;
        constructN: typeof import("ramda").constructN;
        converge: typeof import("ramda").converge;
        curry: typeof import("ramda").curry;
        curryN: typeof import("ramda").curryN;
        descend: typeof import("ramda").descend;
        descendNatural: typeof import("ramda").descendNatural;
        empty: typeof import("ramda").empty;
        flip: typeof import("ramda").flip;
        identity: typeof import("ramda").identity;
        invoker: typeof import("ramda").invoker;
        juxt: typeof import("ramda").juxt;
        lift: typeof import("ramda").lift;
        liftN: typeof import("ramda").liftN;
        memoizeWith: typeof import("ramda").memoizeWith;
        nAry: typeof import("ramda").nAry;
        nthArg: typeof import("ramda").nthArg;
        o: typeof import("ramda").o;
        of: typeof import("ramda").of;
        once: typeof import("ramda").once;
        otherwise: typeof import("ramda").otherwise;
        partial: typeof import("ramda").partial;
        partialRight: typeof import("ramda").partialRight;
        pipe: typeof import("ramda").pipe;
        pipeWith: typeof import("ramda").pipeWith;
        tap: typeof import("ramda").tap;
        thunkify: typeof import("ramda").thunkify;
        tryCatch: typeof import("ramda").tryCatch;
        unapply: typeof import("ramda").unapply;
        unary: typeof import("ramda").unary;
        uncurryN: typeof import("ramda").uncurryN;
        useWith: typeof import("ramda").useWith;
    };
    list: {
        addIndex: typeof import("ramda").addIndex;
        addIndexRight: typeof import("ramda").addIndexRight;
        adjust: typeof import("ramda").adjust;
        all: typeof import("ramda").all;
        any: typeof import("ramda").any;
        aperture: typeof import("ramda").aperture;
        append: typeof import("ramda").append;
        chain: typeof import("ramda").chain;
        collectBy: typeof import("ramda").collectBy;
        concat: typeof import("ramda").concat;
        count: typeof import("ramda").count;
        drop: typeof import("ramda").drop;
        dropLast: typeof import("ramda").dropLast;
        dropLastWhile: typeof import("ramda").dropLastWhile;
        dropRepeats: typeof import("ramda").dropRepeats;
        dropRepeatsBy: typeof import("ramda").dropRepeatsBy;
        dropRepeatsWith: typeof import("ramda").dropRepeatsWith;
        dropWhile: typeof import("ramda").dropWhile;
        endsWith: typeof import("ramda").endsWith;
        filter: typeof import("ramda").filter;
        find: typeof import("ramda").find;
        findIndex: typeof import("ramda").findIndex;
        findLast: typeof import("ramda").findLast;
        findLastIndex: typeof import("ramda").findLastIndex;
        flatten: typeof import("ramda").flatten;
        forEach: typeof import("ramda").forEach;
        fromPairs: typeof import("ramda").fromPairs;
        fromRepeatedPairs: (pairs: [any, any][]) => {
            any?: any | any[];
        };
        groupBy: typeof import("ramda").groupBy;
        groupWith: typeof import("ramda").groupWith;
        head: typeof import("ramda").head;
        includes: typeof import("ramda").includes;
        indexBy: typeof import("ramda").indexBy;
        indexOf: typeof import("ramda").indexOf;
        init: typeof import("ramda").init;
        insert: typeof import("ramda").insert;
        insertAll: typeof import("ramda").insertAll;
        intersperse: typeof import("ramda").intersperse;
        into: typeof import("ramda").into;
        join: typeof import("ramda").join;
        last: typeof import("ramda").last;
        lastIndexOf: typeof import("ramda").lastIndexOf;
        length: typeof import("ramda").length;
        map: typeof import("ramda").map;
        mapAccum: typeof import("ramda").mapAccum;
        mapAccumRight: typeof import("ramda").mapAccumRight;
        mergeAll: typeof import("ramda").mergeAll;
        none: typeof import("ramda").none;
        nth: typeof import("ramda").nth;
        pair: typeof import("ramda").pair;
        partition: typeof import("ramda").partition;
        pluck: typeof import("ramda").pluck;
        prepend: typeof import("ramda").prepend;
        range: (from: number, to?: number) => number[];
        rangeN: {
            (step: number, from: number, to?: number): number[];
            (step: number): (from: number, to?: number) => number[];
            (step: number, from: number): (to?: number) => number[];
        };
        reduce: typeof import("ramda").reduce;
        reduceBy: typeof import("ramda").reduceBy;
        reduceRight: typeof import("ramda").reduceRight;
        reduceWhile: typeof import("ramda").reduceWhile;
        reduced: typeof import("ramda").reduced;
        regExpRange: {
            (from: import("./type/is-numeric.js").Numeric, to?: import("./type/is-numeric.js").Numeric, init?: import("./list/reg-exp-range.js").RegExpRangeInit): string;
            cache: Map<string, {
                a: number;
                b: number;
                isPadded?: boolean;
                maxLen?: number;
                min: import("./type/is-numeric.js").Numeric;
                max: import("./type/is-numeric.js").Numeric;
                negatives?: {
                    pattern: string;
                    count: number[];
                    digits: number;
                    value?: string;
                }[];
                positives?: {
                    pattern: string;
                    count: number[];
                    digits: number;
                    value?: string;
                }[];
                result?: string;
            }>;
            clearCache(): void;
        };
        reject: typeof import("ramda").reject;
        remove: typeof import("ramda").remove;
        repeat: typeof import("ramda").repeat;
        reverse: typeof import("ramda").reverse;
        sample: {
            <T = any>(n: number, list: ArrayLike<T>): T[];
            <T = any>(n: number): (list: ArrayLike<T>) => T[];
        };
        scan: typeof import("ramda").scan;
        sequence: any;
        shuffle: typeof import("./list/shuffle.js").default;
        slice: typeof import("ramda").slice;
        sort: typeof import("ramda").sort;
        splitAt: typeof import("ramda").splitAt;
        splitEvery: typeof import("ramda").splitEvery;
        splitWhen: typeof import("ramda").splitWhen;
        startsWith: typeof import("ramda").startsWith;
        tail: typeof import("ramda").tail;
        take: typeof import("ramda").take;
        takeLast: typeof import("ramda").takeLast;
        takeLastWhile: typeof import("ramda").takeLastWhile;
        takeWhile: typeof import("ramda").takeWhile;
        times: typeof import("ramda").times;
        trailingJoin: {
            (separator: string, list: any[]): string;
            (separator: string): (list: any[]) => string;
        };
        transduce: typeof import("ramda").transduce;
        transpose: typeof import("ramda").transpose;
        traverse: typeof import("ramda").traverse;
        unfold: typeof import("ramda").unfold;
        uniq: typeof import("ramda").uniq;
        uniqBy: typeof import("ramda").uniqBy;
        uniqWith: typeof import("ramda").uniqWith;
        unnest: typeof import("ramda").unnest;
        update: typeof import("ramda").update;
        without: typeof import("ramda").without;
        xprod: typeof import("ramda").xprod;
        zip: typeof import("ramda").zip;
        zipObj: typeof import("ramda").zipObj;
        zipWith: typeof import("ramda").zipWith;
    };
    logic: {
        allPass: typeof import("ramda").allPass;
        and: typeof import("ramda").and;
        anyPass: typeof import("ramda").anyPass;
        both: typeof import("ramda").both;
        complement: typeof import("ramda").complement;
        cond: typeof import("ramda").cond;
        defaultTo: typeof import("ramda").defaultTo;
        either: typeof import("ramda").either;
        ifElse: typeof import("ramda").ifElse;
        isEmpty: typeof import("ramda").isEmpty;
        isNotEmpty: typeof import("ramda").isNotEmpty;
        not: typeof import("ramda").not;
        or: typeof import("ramda").or;
        pathSatisfies: typeof import("ramda").pathSatisfies;
        propSatisfies: typeof import("ramda").propSatisfies;
        unless: typeof import("ramda").unless;
        until: typeof import("ramda").until;
        when: typeof import("ramda").when;
    };
    math: {
        add: typeof import("ramda").add;
        dec: typeof import("ramda").dec;
        divide: typeof import("ramda").divide;
        guid: () => string;
        inc: typeof import("ramda").inc;
        mathMod: typeof import("ramda").mathMod;
        mean: typeof import("ramda").mean;
        median: typeof import("ramda").median;
        modulo: typeof import("ramda").modulo;
        multiply: typeof import("ramda").multiply;
        negate: typeof import("ramda").negate;
        product: typeof import("ramda").product;
        rand: (min?: number, max?: number) => number;
        randHex: (size?: number) => string;
        randInt: (min?: number, max?: number) => number;
        random: () => number;
        subtract: typeof import("ramda").subtract;
        sum: typeof import("ramda").sum;
    };
    object: {
        assoc: typeof import("ramda").assoc;
        assocPath: typeof import("ramda").assocPath;
        bind: typeof import("ramda").bind;
        clone: typeof import("ramda").clone;
        dissoc: typeof import("ramda").dissoc;
        dissocPath: typeof import("ramda").dissocPath;
        eqProps: typeof import("ramda").eqProps;
        evolve: typeof import("ramda").evolve;
        forEachObjIndexed: typeof import("ramda").forEachObjIndexed;
        has: typeof import("ramda").has;
        hasIn: typeof import("ramda").hasIn;
        hasPath: typeof import("ramda").hasPath;
        invert: typeof import("ramda").invert;
        invertObj: typeof import("ramda").invertObj;
        keys: typeof import("ramda").keys;
        keysIn: typeof import("ramda").keysIn;
        lens: typeof import("ramda").lens;
        lensIndex: typeof import("ramda").lensIndex;
        lensPath: typeof import("ramda").lensPath;
        lensProp: typeof import("ramda").lensProp;
        mapObjIndexed: typeof import("ramda").mapObjIndexed;
        mergeDeepLeft: typeof import("ramda").mergeDeepLeft;
        mergeDeepRight: typeof import("ramda").mergeDeepRight;
        mergeDeepWith: typeof import("ramda").mergeDeepWith;
        mergeDeepWithKey: typeof import("ramda").mergeDeepWithKey;
        mergeLeft: typeof import("ramda").mergeLeft;
        mergeRight: typeof import("ramda").mergeRight;
        mergeWith: typeof import("ramda").mergeWith;
        mergeWithKey: typeof import("ramda").mergeWithKey;
        objOf: typeof import("ramda").objOf;
        omit: typeof import("ramda").omit;
        over: typeof import("ramda").over;
        path: typeof import("ramda").path;
        pathOr: typeof import("ramda").pathOr;
        pick: typeof import("ramda").pick;
        pickAll: typeof import("ramda").pickAll;
        pickBy: typeof import("ramda").pickBy;
        project: typeof import("ramda").project;
        prop: typeof import("ramda").prop;
        propOr: typeof import("ramda").propOr;
        props: typeof import("ramda").props;
        set: typeof import("ramda").set;
        toPairs: typeof import("ramda").toPairs;
        toPairsIn: typeof import("ramda").toPairsIn;
        values: typeof import("ramda").values;
        valuesIn: typeof import("ramda").valuesIn;
        view: typeof import("ramda").view;
        where: typeof import("ramda").where;
        whereAny: typeof import("ramda").whereAny;
        whereEq: typeof import("ramda").whereEq;
    };
    relation: {
        clamp: typeof import("ramda").clamp;
        countBy: typeof import("ramda").countBy;
        difference: typeof import("ramda").difference;
        differenceWith: typeof import("ramda").differenceWith;
        eqBy: typeof import("ramda").eqBy;
        equals: typeof import("ramda").equals;
        gt: typeof import("ramda").gt;
        gte: typeof import("ramda").gte;
        identical: typeof import("ramda").identical;
        innerJoin: typeof import("ramda").innerJoin;
        intersection: typeof import("ramda").intersection;
        lt: typeof import("ramda").lt;
        lte: typeof import("ramda").lte;
        max: typeof import("ramda").max;
        maxBy: typeof import("ramda").maxBy;
        min: typeof import("ramda").min;
        minBy: typeof import("ramda").minBy;
        pathEq: typeof import("ramda").pathEq;
        project: typeof import("ramda").project;
        propEq: typeof import("ramda").propEq;
        sortBy: typeof import("ramda").sortBy;
        sortWith: typeof import("ramda").sortWith;
        symmetricDifference: typeof import("ramda").symmetricDifference;
        symmetricDifferenceWith: typeof import("ramda").symmetricDifferenceWith;
        union: typeof import("ramda").union;
        unionWith: typeof import("ramda").unionWith;
    };
    string: {
        decodeHtml: (value: string) => string;
        decodeURIComponent: typeof import("./string/decode-uri-component.js").default;
        encodeHtml: (value: string) => string;
        encodeURIComponent: (value: string) => string;
        interpolate: (template: string, replacements: string | any[] | {
            [key: string]: any;
        }, syntax?: RegExp) => string;
        match: typeof import("ramda").match;
        removeNonPrintable: (value: string) => string;
        removeNonWord: (value: string) => string;
        replace: typeof import("ramda").replace;
        replaceDiacritics: (a: string) => string;
        slugify: {
            (delimiter: string, value: string): string;
            (delimiter: string): (value: string) => string;
        };
        split: typeof import("ramda").split;
        test: typeof import("ramda").test;
        toCamel: (value: string) => string;
        toLower: typeof import("ramda").toLower;
        toPascal: (value: string) => string;
        toProper: (value: string) => string;
        toRegExp: (value: string) => RegExp;
        toSentence: (value: string) => string;
        toString: (value: any) => string;
        toUpper: typeof import("ramda").toUpper;
        trailingSplit: {
            (separator: string, text: string): string[];
            (separator: string): (text: string) => string[];
        };
        trim: typeof import("ramda").trim;
    };
    types: {
        is: typeof import("ramda").is;
        isConstructor: (value: any) => value is Function;
        isFunction: (value: any) => value is Function;
        isNil: typeof import("ramda").isNil;
        isNotNil: typeof import("ramda").isNotNil;
        isNumber: (value: any) => value is number;
        isNumeric: (value: any) => value is import("./type/is-numeric.js").Numeric;
        isString: (value: any) => value is string;
        isValidDate: (value: any) => value is Date;
        like: {
            (descriptor: import("./type/like.js").LikeDescriptor, value: any): boolean;
            (descriptor: import("./type/like.js").LikeDescriptor): (value: any) => boolean;
        };
        likeArray: (value: any) => value is ArrayLike<any>;
        likePromise: (value: any) => value is PromiseLike<any>;
        propIs: typeof import("ramda").propIs;
        type: typeof import("ramda").type;
    };
    date: typeof date;
};
export default _default;
//# sourceMappingURL=index.d.ts.map