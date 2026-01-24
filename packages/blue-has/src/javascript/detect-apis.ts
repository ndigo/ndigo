import detectJavaScriptFeatures from './detect-features';
import { defineDetector } from '../has';

export default () => {
    detectJavaScriptFeatures();

    defineDetector(
        'es5_array',
        (has) =>
            has.array_prototype &&
            has.array_every &&
            has.array_filter &&
            has.array_foreach &&
            has.array_indexof &&
            has.array_isarray &&
            has.array_lastindexof &&
            has.array_map &&
            has.array_some &&
            has.array_reduce &&
            has.array_reduceright
    );

    const isoDate = '2013-04-12T06:06:37.307Z';
    let isoDateSupported = false;

    try {
        isoDateSupported = !!Date.parse(isoDate);
    } catch (e) {
        // no ISO date parsing yet
    }

    defineDetector(
        'es5_date',
        (has) => isoDateSupported && has.date_prototype && has.date_toisostring && has.date_tojson && has.date_now
    );

    defineDetector('es5_function', (has) => has.function_prototype && has.function_bind);

    defineDetector(
        'es5_object',
        (has) =>
            has.object_create &&
            has.object_defineproperty &&
            has.object_defineproperties &&
            has.object_freeze &&
            has.object_getownpropertydescriptor &&
            has.object_getownpropertynames &&
            has.object_getprototypeof &&
            has.object_isextensible &&
            has.object_isfrozen &&
            has.object_issealed &&
            has.object_keys &&
            has.object_preventextensions &&
            has.object_seal
    );

    defineDetector('es5_string', (has) => has.string_prototype && has.string_trim);

    defineDetector('es5_syntax', function (): boolean {
        'use strict';
        let value, obj, stringAccess, getter, setter, reservedWords; //, zeroWidthChars;
        try {
            /* eslint no-eval: "off" */
            // Property access on strings
            stringAccess = eval('"foobar"[3] === "b"');
            // Getter in property initializer
            getter = eval('({ get x(){ return 1 } }).x === 1');
            eval('({ set x(v){ value = v; } }).x = 1');
            // Setter in property initializer
            setter = value === 1;
            // Reserved words as property names
            eval('obj = ({ if: 1 })');
            reservedWords = obj['if'] === 1;
            // Commented this out because it would not work when run in Karma -JBR
            // Zero-width characters in identifiers
            //zeroWidthChars = eval( '_\u200c\u200d = true' );

            return stringAccess && getter && setter && reservedWords; // && zeroWidthChars;
        } catch (e) {
            return false;
        }
    });

    defineDetector('es5_undefined', function (): boolean {
        let result: boolean, original;
        try {
            original = undefined;
            // @ts-ignore
            undefined = 12345;
            result = typeof undefined === 'undefined';
            // @ts-ignore
            undefined = original;
        } catch (e) {
            return e instanceof TypeError && /read(\s|\-)?only/.test(e.message);
        }
        return result;
    });

    defineDetector('strict_mode', () =>
        (function () {
            'use strict';
            return !this;
        })()
    );

    defineDetector(
        'es5',
        (has) =>
            has.es5_array &&
            has.es5_date &&
            has.es5_function &&
            has.es5_object &&
            has.es5_string &&
            has.es5_syntax &&
            has.es5_undefined &&
            has.json &&
            has.strict_mode
    );

    defineDetector(
        'es6_array',
        (has) =>
            has.array_prototype &&
            has.array_copywithin &&
            has.array_entries &&
            has.array_fill &&
            has.array_find &&
            has.array_findindex &&
            has.array_from &&
            has.array_keys &&
            has.array_of &&
            has.array_values
    );

    defineDetector('arrow', function (): boolean {
        try {
            // eslint-disable-next-line
            eval('()=>{}');
        } catch (e) {
            return false;
        }
        return true;
    });

    defineDetector('es6_collections', (has) => has.map && has.set && has.weakmap && has.weakset);

    defineDetector('generators', function (): boolean {
        try {
            new Function('function* test() {}')();
        } catch (e) {
            return false;
        }
        return true;
    });

    defineDetector(
        'es6_math',
        (has) =>
            has.math &&
            has.math_acosh &&
            has.math_asinh &&
            has.math_atanh &&
            has.math_cbrt &&
            has.math_clz32 &&
            has.math_cosh &&
            has.math_expm1 &&
            has.math_fround &&
            has.math_hypot &&
            has.math_imul &&
            has.math_log1p &&
            has.math_log10 &&
            has.math_log2 &&
            has.math_sign &&
            has.math_sinh &&
            has.math_tanh &&
            has.math_trunc
    );

    defineDetector(
        'es6_number',
        (has) =>
            has.number_epsilon &&
            has.number_isfinite &&
            has.number_isinteger &&
            has.number_isnan &&
            has.number_issafeinteger &&
            has.number_max_safe_integer &&
            has.number_min_safe_integer &&
            has.number_parsefloat &&
            has.number_parseint &&
            has.number_tofixed &&
            has.number_toprecision
    );

    defineDetector('es6_object', (has) => has.object_assign && has.object_is && has.object_setprototypeof);

    defineDetector(
        'es6_promise',
        (has) =>
            has.promise_prototype &&
            has.promise_all &&
            has.promise_catch &&
            has.promise_race &&
            has.promise_reject &&
            has.promise_resolve &&
            has.promise_then
    );

    defineDetector(
        'es6_reflect',
        (has) =>
            has.reflect_apply &&
            has.reflect_construct &&
            has.reflect_defineproperty &&
            has.reflect_deleteproperty &&
            has.reflect_get &&
            has.reflect_getownpropertydescriptor &&
            has.reflect_getprototypeof &&
            has.reflect_has &&
            has.reflect_isextensible &&
            has.reflect_ownkeys &&
            has.reflect_preventextensions &&
            has.reflect_set &&
            has.reflect_setprototypeof
    );

    defineDetector('es6_regexp', (has) => has.regexp_flags);

    defineDetector(
        'es6_string',
        (has) =>
            has.string_codepointat &&
            has.string_endswith &&
            has.string_fromcodepoint &&
            has.string_includes &&
            has.string_normalize &&
            has.string_raw &&
            has.string_repeat &&
            has.string_startswith
    );

    defineDetector(
        'es6_symbol',
        (has) =>
            has.symbol_prototype &&
            has.symbol_for &&
            has.symbol_keyfor &&
            has.symbol_hasinstance &&
            has.symbol_isconcatspreadable &&
            has.symbol_iterator &&
            has.symbol_match &&
            has.symbol_replace &&
            has.symbol_search &&
            has.symbol_species &&
            has.symbol_split &&
            has.symbol_toprimitive &&
            has.symbol_tostringtag &&
            has.symbol_unscopables
    );

    defineDetector('classes', function (): boolean {
        let supports: boolean;
        try {
            // eslint-disable-next-line
            eval('class Test {}');
            supports = true;
        } catch (e) {}
        return !!supports;
    });

    defineDetector('template_literals', function (): boolean {
        let supports: boolean;
        try {
            // A number of tools, including uglifyjs and require, break on a raw "`", so
            // use an eval to get around that.
            // eslint-disable-next-line
            eval('``');
            supports = true;
        } catch (e) {}
        return !!supports;
    });

    defineDetector(
        'es6',
        (has) =>
            has.arrow &&
            has.es6_array &&
            has.es6_collections &&
            has.es6_math &&
            has.es6_object &&
            has.es6_promise &&
            has.es6_reflect &&
            has.es6_regexp &&
            has.es6_string &&
            has.es6_symbol &&
            has.classes &&
            has.generators &&
            has.template_literals
    );

    defineDetector('infix_operator', function (): boolean {
        let supports: boolean;
        try {
            const squared: number = eval('3 ** 2');
            supports = squared === 9;
        } catch (e) {}
        return !!supports;
    });

    defineDetector('es7_array', (has) => has.array_includes);

    defineDetector('es7_string', (has) => has.string_trimleft && has.string_trimright);

    defineDetector('es7', (has) => has.es7_array && has.es7_string && has.infix_operator);

    defineDetector(
        'async_await',
        (has) =>
            has.promise &&
            (function () {
                let supports: boolean;
                try {
                    const value = eval('( async function(){} )()');
                    supports = value instanceof Promise;
                } catch (e) {}
                return !!supports;
            })()
    );

    defineDetector(
        'es8_object',
        (has) => has.object_entries && has.object_getownpropertydescriptors && has.object_values
    );

    defineDetector('es8_string', (has) => has.string_padend && has.string_padstart);

    defineDetector('es8', (has) => has.async_await && has.es8_object && has.es8_string && has.sharedarraybuffer);

    // Could detect ES9 RegExp changes as well

    defineDetector('es9_promise', (has) => has.promise_finally);

    defineDetector('es9_symbol', (has) => has.symbol_asynciterator);

    defineDetector('es9', (has) => has.es9_promise && has.es9_symbol);

    defineDetector('es10_array', (has) => has.array_flat && has.array_flatmap);

    defineDetector('es10_object', (has) => has.object_fromentries);

    defineDetector('es10_string', (has) => has.string_trimstart && has.string_trimend);

    defineDetector(
        'symbol_description',
        (has) =>
            has.symbol_prototype &&
            (function () {
                const sym = Symbol('test');
                return sym.description === 'test';
            })()
    );

    defineDetector('es10_symbol', (has) => has.symbol_description);

    // Could detect ES10 optional catch binding

    defineDetector('es10', (has) => has.es10_array && has.es10_object && has.es10_string && has.es10_symbol);

    defineDetector('es11_promise', (has) => has.promise_allsettled);

    defineDetector('es11_string', (has) => has.string_matchall);

    // Could detect ES11 dynamic import, nullish coalescing, an optional chaining

    defineDetector('es11', (has) => has.bigint && has.es11_promise && has.es11_string);

    defineDetector('es12_promise ', (has) => has.promise_any && has.aggregateerror);

    defineDetector('es12_string', (has) => has.string_replaceall);

    defineDetector('es12', (has) => has.es12_promise && has.es12_string && has.weakref && has.finalizationregistry);

    const decorate = () => void 0;
    decorate();

    defineDetector('class_decorators', function (): boolean {
        let supports: boolean;
        try {
            // eslint-disable-next-line
            eval('@decorate class Test {}');
            supports = true;
        } catch (e) {}
        return !!supports;
    });

    defineDetector('method_decorators', function (): boolean {
        let supports: boolean;
        try {
            // eslint-disable-next-line
            eval('class Test { @decorate test(){} }');
            supports = true;
        } catch (e) {}
        return !!supports;
    });

    defineDetector('decorators', (has) => has.class_decorators && has.method_decorators);

    defineDetector(
        'reflect_metadata_api',
        (has) =>
            has.decorators &&
            has.es6_reflect &&
            has.reflect_definemetadata &&
            has.reflect_deletemetadata &&
            has.reflect_getmetadata &&
            has.reflect_getmetadatakeys &&
            has.reflect_getownmetadata &&
            has.reflect_getownmetadatakeys &&
            has.reflect_hasmetadata &&
            has.reflect_hasownmetadata &&
            has.reflect_metadata
    );
};
