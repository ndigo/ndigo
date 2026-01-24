/* eslint-disable no-undef */
import { defineDetector } from '../has';

// Generated file. Do not edit!

export default () => {
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('aggregateerror', () => typeof AggregateError === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array', () => typeof Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_from', (has) => has.array && typeof Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_isarray', (has) => has.array && typeof Array.isArray === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_of', (has) => has.array && typeof Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_prototype', (has) => has.array && typeof Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_concat', (has) => has.array_prototype && typeof Array.prototype.concat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_flat', (has) => has.array_prototype && typeof Array.prototype.flat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_flatmap', (has) => has.array_prototype && typeof Array.prototype.flatMap === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_pop', (has) => has.array_prototype && typeof Array.prototype.pop === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_push', (has) => has.array_prototype && typeof Array.prototype.push === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_shift', (has) => has.array_prototype && typeof Array.prototype.shift === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_splice', (has) => has.array_prototype && typeof Array.prototype.splice === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_uniqueby', (has) => has.array_prototype && typeof Array.prototype.uniqueBy === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_unshift', (has) => has.array_prototype && typeof Array.prototype.unshift === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_at', (has) => has.array_prototype && typeof Array.prototype.at === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'array_copywithin',
        (has) => has.array_prototype && typeof Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_every', (has) => has.array_prototype && typeof Array.prototype.every === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_fill', (has) => has.array_prototype && typeof Array.prototype.fill === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_filter', (has) => has.array_prototype && typeof Array.prototype.filter === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_filterout', (has) => has.array_prototype && typeof Array.prototype.filterOut === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_find', (has) => has.array_prototype && typeof Array.prototype.find === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_findindex', (has) => has.array_prototype && typeof Array.prototype.findIndex === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_includes', (has) => has.array_prototype && typeof Array.prototype.includes === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_indexof', (has) => has.array_prototype && typeof Array.prototype.indexOf === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_join', (has) => has.array_prototype && typeof Array.prototype.join === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'array_lastindexof',
        (has) => has.array_prototype && typeof Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_map', (has) => has.array_prototype && typeof Array.prototype.map === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_reduce', (has) => has.array_prototype && typeof Array.prototype.reduce === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'array_reduceright',
        (has) => has.array_prototype && typeof Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_reverse', (has) => has.array_prototype && typeof Array.prototype.reverse === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_slice', (has) => has.array_prototype && typeof Array.prototype.slice === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_some', (has) => has.array_prototype && typeof Array.prototype.some === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_sort', (has) => has.array_prototype && typeof Array.prototype.sort === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_foreach', (has) => has.array_prototype && typeof Array.prototype.forEach === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_entries', (has) => has.array_prototype && typeof Array.prototype.entries === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_keys', (has) => has.array_prototype && typeof Array.prototype.keys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('array_values', (has) => has.array_prototype && typeof Array.prototype.values === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('arraybuffer', () => typeof ArrayBuffer === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('arraybuffer_isview', (has) => has.arraybuffer && typeof ArrayBuffer.isView === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('arraybuffer_prototype', (has) => has.arraybuffer && typeof ArrayBuffer.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'arraybuffer_bytelength',
        (has) => has.arraybuffer_prototype && typeof ArrayBuffer.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'arraybuffer_slice',
        (has) => has.arraybuffer_prototype && typeof ArrayBuffer.prototype.slice === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('asynciterator', () => typeof AsyncIterator === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('asynciterator_from', (has) => has.asynciterator && typeof AsyncIterator.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_prototype',
        (has) => has.asynciterator && typeof AsyncIterator.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_asindexedpairs',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.asIndexedPairs === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_drop',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.drop === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_every',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_filter',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_find',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_flatmap',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.flatMap === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_foreach',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_map',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_reduce',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_some',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_take',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.take === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'asynciterator_toarray',
        (has) => has.asynciterator_prototype && typeof AsyncIterator.prototype.toArray === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('bigint', () => typeof BigInt === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('bigint_range', (has) => has.bigint && typeof BigInt.range === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('bigint64array', () => typeof BigInt64Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('bigint64array_from', (has) => has.bigint64array && typeof BigInt64Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('bigint64array_of', (has) => has.bigint64array && typeof BigInt64Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_prototype',
        (has) => has.bigint64array && typeof BigInt64Array.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_buffer',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_bytelength',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_byteoffset',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_length',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_at',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_copywithin',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_every',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_fill',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_filter',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_filterout',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_find',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_findindex',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_includes',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_indexof',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_join',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_lastindexof',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_map',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_reduce',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_reduceright',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_reverse',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_slice',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_some',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_sort',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_foreach',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_entries',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_keys',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'bigint64array_values',
        (has) => has.bigint64array_prototype && typeof BigInt64Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('biguint64array', () => typeof BigUint64Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('biguint64array_from', (has) => has.biguint64array && typeof BigUint64Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('biguint64array_of', (has) => has.biguint64array && typeof BigUint64Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_prototype',
        (has) => has.biguint64array && typeof BigUint64Array.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_buffer',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_bytelength',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_byteoffset',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_length',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_at',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_copywithin',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_every',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_fill',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_filter',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_filterout',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_find',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_findindex',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_includes',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_indexof',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_join',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_lastindexof',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_map',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_reduce',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_reduceright',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_reverse',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_slice',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_some',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_sort',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_foreach',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_entries',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_keys',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'biguint64array_values',
        (has) => has.biguint64array_prototype && typeof BigUint64Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache', () => typeof Cache === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_prototype', (has) => has.cache && typeof Cache.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_add', (has) => has.cache_prototype && typeof Cache.prototype.add === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_addall', (has) => has.cache_prototype && typeof Cache.prototype.addAll === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_delete', (has) => has.cache_prototype && typeof Cache.prototype.delete === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_keys', (has) => has.cache_prototype && typeof Cache.prototype.keys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_match', (has) => has.cache_prototype && typeof Cache.prototype.match === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_matchall', (has) => has.cache_prototype && typeof Cache.prototype.matchAll === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cache_put', (has) => has.cache_prototype && typeof Cache.prototype.put === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('caches', () => typeof caches === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cachestorage', () => typeof CacheStorage === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('cachestorage_prototype', (has) => has.cachestorage && typeof CacheStorage.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'cachestorage_delete',
        (has) => has.cachestorage_prototype && typeof CacheStorage.prototype.delete === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'cachestorage_has',
        (has) => has.cachestorage_prototype && typeof CacheStorage.prototype.has === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'cachestorage_keys',
        (has) => has.cachestorage_prototype && typeof CacheStorage.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'cachestorage_match',
        (has) => has.cachestorage_prototype && typeof CacheStorage.prototype.match === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'cachestorage_open',
        (has) => has.cachestorage_prototype && typeof CacheStorage.prototype.open === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('dataview', () => typeof DataView === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('dataview_prototype', (has) => has.dataview && typeof DataView.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('dataview_buffer', (has) => has.dataview_prototype && typeof DataView.prototype.buffer === 'number');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_bytelength',
        (has) => has.dataview_prototype && typeof DataView.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_byteoffset',
        (has) => has.dataview_prototype && typeof DataView.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getbigint64',
        (has) => has.dataview_prototype && typeof DataView.prototype.getBigInt64 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getbiguint64',
        (has) => has.dataview_prototype && typeof DataView.prototype.getBigUint64 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getfloat32',
        (has) => has.dataview_prototype && typeof DataView.prototype.getFloat32 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getfloat64',
        (has) => has.dataview_prototype && typeof DataView.prototype.getFloat64 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getint8',
        (has) => has.dataview_prototype && typeof DataView.prototype.getInt8 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getint16',
        (has) => has.dataview_prototype && typeof DataView.prototype.getInt16 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getint32',
        (has) => has.dataview_prototype && typeof DataView.prototype.getInt32 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getuint8',
        (has) => has.dataview_prototype && typeof DataView.prototype.getUint8 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getuint16',
        (has) => has.dataview_prototype && typeof DataView.prototype.getUint16 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_getuint32',
        (has) => has.dataview_prototype && typeof DataView.prototype.getUint32 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setbigint64',
        (has) => has.dataview_prototype && typeof DataView.prototype.setBigInt64 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setbiguint64',
        (has) => has.dataview_prototype && typeof DataView.prototype.setBigUint64 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setfloat32',
        (has) => has.dataview_prototype && typeof DataView.prototype.setFloat32 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setfloat64',
        (has) => has.dataview_prototype && typeof DataView.prototype.setFloat64 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setint8',
        (has) => has.dataview_prototype && typeof DataView.prototype.setInt8 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setint16',
        (has) => has.dataview_prototype && typeof DataView.prototype.setInt16 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setint32',
        (has) => has.dataview_prototype && typeof DataView.prototype.setInt32 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setuint8',
        (has) => has.dataview_prototype && typeof DataView.prototype.setUint8 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setuint16',
        (has) => has.dataview_prototype && typeof DataView.prototype.setUint16 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'dataview_setuint32',
        (has) => has.dataview_prototype && typeof DataView.prototype.setUint32 === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date', () => typeof Date === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_now', (has) => has.date && typeof Date.now === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_parse', (has) => has.date && typeof Date.parse === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_utc', (has) => has.date && typeof Date.UTC === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_prototype', (has) => has.date && typeof Date.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getdate', (has) => has.date_prototype && typeof Date.prototype.getDate === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getday', (has) => has.date_prototype && typeof Date.prototype.getDay === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getfullyear', (has) => has.date_prototype && typeof Date.prototype.getFullYear === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_gethours', (has) => has.date_prototype && typeof Date.prototype.getHours === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_getmilliseconds',
        (has) => has.date_prototype && typeof Date.prototype.getMilliseconds === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getminutes', (has) => has.date_prototype && typeof Date.prototype.getMinutes === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getmonth', (has) => has.date_prototype && typeof Date.prototype.getMonth === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getseconds', (has) => has.date_prototype && typeof Date.prototype.getSeconds === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_gettime', (has) => has.date_prototype && typeof Date.prototype.getTime === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_gettimezoneoffset',
        (has) => has.date_prototype && typeof Date.prototype.getTimezoneOffset === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getutcdate', (has) => has.date_prototype && typeof Date.prototype.getUTCDate === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getutcday', (has) => has.date_prototype && typeof Date.prototype.getUTCDay === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_getutcfullyear',
        (has) => has.date_prototype && typeof Date.prototype.getUTCFullYear === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getutchours', (has) => has.date_prototype && typeof Date.prototype.getUTCHours === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_getutcmilliseconds',
        (has) => has.date_prototype && typeof Date.prototype.getUTCMilliseconds === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_getutcminutes',
        (has) => has.date_prototype && typeof Date.prototype.getUTCMinutes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_getutcmonth', (has) => has.date_prototype && typeof Date.prototype.getUTCMonth === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_getutcseconds',
        (has) => has.date_prototype && typeof Date.prototype.getUTCSeconds === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setdate', (has) => has.date_prototype && typeof Date.prototype.setDate === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setfullyear', (has) => has.date_prototype && typeof Date.prototype.setFullYear === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_sethours', (has) => has.date_prototype && typeof Date.prototype.setHours === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_setmilliseconds',
        (has) => has.date_prototype && typeof Date.prototype.setMilliseconds === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setminutes', (has) => has.date_prototype && typeof Date.prototype.setMinutes === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setmonth', (has) => has.date_prototype && typeof Date.prototype.setMonth === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setseconds', (has) => has.date_prototype && typeof Date.prototype.setSeconds === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_settime', (has) => has.date_prototype && typeof Date.prototype.setTime === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setutcdate', (has) => has.date_prototype && typeof Date.prototype.setUTCDate === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_setutcfullyear',
        (has) => has.date_prototype && typeof Date.prototype.setUTCFullYear === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setutchours', (has) => has.date_prototype && typeof Date.prototype.setUTCHours === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_setutcmilliseconds',
        (has) => has.date_prototype && typeof Date.prototype.setUTCMilliseconds === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_setutcminutes',
        (has) => has.date_prototype && typeof Date.prototype.setUTCMinutes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_setutcmonth', (has) => has.date_prototype && typeof Date.prototype.setUTCMonth === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_setutcseconds',
        (has) => has.date_prototype && typeof Date.prototype.setUTCSeconds === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_todatestring',
        (has) => has.date_prototype && typeof Date.prototype.toDateString === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_toisostring', (has) => has.date_prototype && typeof Date.prototype.toISOString === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_tojson', (has) => has.date_prototype && typeof Date.prototype.toJSON === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_tolocaledatestring',
        (has) => has.date_prototype && typeof Date.prototype.toLocaleDateString === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_tolocaleformat',
        (has) => has.date_prototype && typeof Date.prototype.toLocaleFormat === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_tolocaletimestring',
        (has) => has.date_prototype && typeof Date.prototype.toLocaleTimeString === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'date_totimestring',
        (has) => has.date_prototype && typeof Date.prototype.toTimeString === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('date_toutcstring', (has) => has.date_prototype && typeof Date.prototype.toUTCString === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('decodeuri', () => typeof decodeURI === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('decodeuricomponent', () => typeof decodeURIComponent === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('encodeuri', () => typeof encodeURI === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('encodeuricomponent', () => typeof encodeURIComponent === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('finalizationregistry', () => typeof FinalizationRegistry === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'finalizationregistry_prototype',
        (has) => has.finalizationregistry && typeof FinalizationRegistry.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'finalizationregistry_register',
        (has) => has.finalizationregistry_prototype && typeof FinalizationRegistry.prototype.register === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'finalizationregistry_unregister',
        (has) => has.finalizationregistry_prototype && typeof FinalizationRegistry.prototype.unregister === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float32array', () => typeof Float32Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float32array_from', (has) => has.float32array && typeof Float32Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float32array_of', (has) => has.float32array && typeof Float32Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float32array_prototype', (has) => has.float32array && typeof Float32Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_buffer',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_bytelength',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_byteoffset',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_length',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_at',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_copywithin',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_every',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_fill',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_filter',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_filterout',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_find',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_findindex',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_includes',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_indexof',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_join',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_lastindexof',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_map',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_reduce',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_reduceright',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_reverse',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_slice',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_some',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_sort',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_foreach',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_entries',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_keys',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float32array_values',
        (has) => has.float32array_prototype && typeof Float32Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float64array', () => typeof Float64Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float64array_from', (has) => has.float64array && typeof Float64Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float64array_of', (has) => has.float64array && typeof Float64Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('float64array_prototype', (has) => has.float64array && typeof Float64Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_buffer',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_bytelength',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_byteoffset',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_length',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_at',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_copywithin',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_every',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_fill',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_filter',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_filterout',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_find',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_findindex',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_includes',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_indexof',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_join',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_lastindexof',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_map',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_reduce',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_reduceright',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_reverse',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_slice',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_some',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_sort',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_foreach',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_entries',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_keys',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'float64array_values',
        (has) => has.float64array_prototype && typeof Float64Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('function', () => typeof Function === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('function_prototype', (has) => has.function && typeof Function.prototype === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('function_apply', (has) => has.function_prototype && typeof Function.prototype.apply === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('function_bind', (has) => has.function_prototype && typeof Function.prototype.bind === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('function_call', (has) => has.function_prototype && typeof Function.prototype.call === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('function_name', (has) => has.function_prototype && typeof Function.prototype.name === 'string');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'function_isgenerator',
        (has) => has.function_prototype && typeof Function.prototype.isGenerator === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'function_tosource',
        (has) => has.function_prototype && typeof Function.prototype.toSource === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('globalthis', () => typeof globalThis === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int8array', () => typeof Int8Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int8array_from', (has) => has.int8array && typeof Int8Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int8array_of', (has) => has.int8array && typeof Int8Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int8array_prototype', (has) => has.int8array && typeof Int8Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_buffer',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_bytelength',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_byteoffset',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_length',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int8array_at', (has) => has.int8array_prototype && typeof Int8Array.prototype.at === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_copywithin',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_every',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_fill',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_filter',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_filterout',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_find',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_findindex',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_includes',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_indexof',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_join',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_lastindexof',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int8array_map', (has) => has.int8array_prototype && typeof Int8Array.prototype.map === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_reduce',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_reduceright',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_reverse',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_slice',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_some',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_sort',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_foreach',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_entries',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_keys',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int8array_values',
        (has) => has.int8array_prototype && typeof Int8Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int16array', () => typeof Int16Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int16array_from', (has) => has.int16array && typeof Int16Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int16array_of', (has) => has.int16array && typeof Int16Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int16array_prototype', (has) => has.int16array && typeof Int16Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_buffer',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_bytelength',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_byteoffset',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_length',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int16array_at', (has) => has.int16array_prototype && typeof Int16Array.prototype.at === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_copywithin',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_every',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_fill',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_filter',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_filterout',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_find',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_findindex',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_includes',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_indexof',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_join',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_lastindexof',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_map',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_reduce',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_reduceright',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_reverse',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_slice',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_some',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_sort',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_foreach',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_entries',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_keys',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int16array_values',
        (has) => has.int16array_prototype && typeof Int16Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int32array', () => typeof Int32Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int32array_from', (has) => has.int32array && typeof Int32Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int32array_of', (has) => has.int32array && typeof Int32Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int32array_prototype', (has) => has.int32array && typeof Int32Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_buffer',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_bytelength',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_byteoffset',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_length',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('int32array_at', (has) => has.int32array_prototype && typeof Int32Array.prototype.at === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_copywithin',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_every',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_fill',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_filter',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_filterout',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_find',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_findindex',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_includes',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_indexof',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_join',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_lastindexof',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_map',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_reduce',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_reduceright',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_reverse',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_slice',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_some',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_sort',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_foreach',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_entries',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_keys',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'int32array_values',
        (has) => has.int32array_prototype && typeof Int32Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl', () => typeof Intl === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_collator', (has) => has.intl && typeof Intl.Collator === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_collator_prototype',
        (has) => has.intl_collator && typeof Intl.Collator.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_collator_compare',
        (has) => has.intl_collator_prototype && typeof Intl.Collator.prototype.compare === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_collator_resolvedoptions',
        (has) => has.intl_collator_prototype && typeof Intl.Collator.prototype.resolvedOptions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_collator_supportedlocalesof',
        (has) => has.intl_collator && typeof Intl.Collator.supportedLocalesOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_datetimeformat', (has) => has.intl && typeof Intl.DateTimeFormat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_datetimeformat_prototype',
        (has) => has.intl_datetimeformat && typeof Intl.DateTimeFormat.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_datetimeformat_format',
        (has) => has.intl_datetimeformat_prototype && typeof Intl.DateTimeFormat.prototype.format === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_datetimeformat_formattoparts',
        (has) => has.intl_datetimeformat_prototype && typeof Intl.DateTimeFormat.prototype.formatToParts === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_datetimeformat_resolvedoptions',
        (has) =>
            has.intl_datetimeformat_prototype && typeof Intl.DateTimeFormat.prototype.resolvedOptions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_datetimeformat_supportedlocalesof',
        (has) => has.intl_datetimeformat && typeof Intl.DateTimeFormat.supportedLocalesOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_listformat', (has) => has.intl && typeof Intl.ListFormat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_listformat_prototype',
        (has) => has.intl_listformat && typeof Intl.ListFormat.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_listformat_format',
        (has) => has.intl_listformat_prototype && typeof Intl.ListFormat.prototype.format === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_listformat_formattoparts',
        (has) => has.intl_listformat_prototype && typeof Intl.ListFormat.prototype.formatToParts === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_listformat_resolvedoptions',
        (has) => has.intl_listformat_prototype && typeof Intl.ListFormat.prototype.resolvedOptions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_listformat_supportedlocalesof',
        (has) => has.intl_listformat && typeof Intl.ListFormat.supportedLocalesOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_numberformat', (has) => has.intl && typeof Intl.NumberFormat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_numberformat_prototype',
        (has) => has.intl_numberformat && typeof Intl.NumberFormat.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_numberformat_format',
        (has) => has.intl_numberformat_prototype && typeof Intl.NumberFormat.prototype.format === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_numberformat_formattoparts',
        (has) => has.intl_numberformat_prototype && typeof Intl.NumberFormat.prototype.formatToParts === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_numberformat_resolvedoptions',
        (has) => has.intl_numberformat_prototype && typeof Intl.NumberFormat.prototype.resolvedOptions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_numberformat_supportedlocalesof',
        (has) => has.intl_numberformat && typeof Intl.NumberFormat.supportedLocalesOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_pluralrules', (has) => has.intl && typeof Intl.PluralRules === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_pluralrules_prototype',
        (has) => has.intl_pluralrules && typeof Intl.PluralRules.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_pluralrules_resolvedoptions',
        (has) => has.intl_pluralrules_prototype && typeof Intl.PluralRules.prototype.resolvedOptions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_pluralrules_select',
        (has) => has.intl_pluralrules && typeof Intl.PluralRules.select === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_pluralrules_supportedlocalesof',
        (has) => has.intl_pluralrules && typeof Intl.PluralRules.supportedLocalesOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_relativetimeformat', (has) => has.intl && typeof Intl.RelativeTimeFormat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_relativetimeformat_prototype',
        (has) => has.intl_relativetimeformat && typeof Intl.RelativeTimeFormat.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_relativetimeformat_format',
        (has) => has.intl_relativetimeformat_prototype && typeof Intl.RelativeTimeFormat.prototype.format === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_relativetimeformat_formattoparts',
        (has) =>
            has.intl_relativetimeformat_prototype &&
            typeof Intl.RelativeTimeFormat.prototype.formatToParts === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_relativetimeformat_resolvedoptions',
        (has) =>
            has.intl_relativetimeformat_prototype &&
            typeof Intl.RelativeTimeFormat.prototype.resolvedOptions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'intl_relativetimeformat_supportedlocalesof',
        (has) => has.intl_relativetimeformat && typeof Intl.RelativeTimeFormat.supportedLocalesOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('intl_getcanonicallocales', (has) => has.intl && typeof Intl.getCanonicalLocales === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('isfinite', () => typeof isFinite === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('isnan', () => typeof isNaN === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator', () => typeof Iterator === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_from', (has) => has.iterator && typeof Iterator.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_prototype', (has) => has.iterator && typeof Iterator.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'iterator_asindexedpairs',
        (has) => has.iterator_prototype && typeof Iterator.prototype.asIndexedPairs === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_drop', (has) => has.iterator_prototype && typeof Iterator.prototype.drop === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_every', (has) => has.iterator_prototype && typeof Iterator.prototype.every === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'iterator_filter',
        (has) => has.iterator_prototype && typeof Iterator.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_find', (has) => has.iterator_prototype && typeof Iterator.prototype.find === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'iterator_flatmap',
        (has) => has.iterator_prototype && typeof Iterator.prototype.flatMap === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'iterator_foreach',
        (has) => has.iterator_prototype && typeof Iterator.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_map', (has) => has.iterator_prototype && typeof Iterator.prototype.map === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'iterator_reduce',
        (has) => has.iterator_prototype && typeof Iterator.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_some', (has) => has.iterator_prototype && typeof Iterator.prototype.some === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('iterator_take', (has) => has.iterator_prototype && typeof Iterator.prototype.take === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'iterator_toarray',
        (has) => has.iterator_prototype && typeof Iterator.prototype.toArray === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('json', () => typeof JSON === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('json_parse', (has) => has.json && typeof JSON.parse === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('json_stringify', (has) => has.json && typeof JSON.stringify === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map', () => typeof Map === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_prototype', (has) => has.map && typeof Map.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_clear', (has) => has.map_prototype && typeof Map.prototype.clear === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_delete', (has) => has.map_prototype && typeof Map.prototype.delete === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_emplace', (has) => has.map_prototype && typeof Map.prototype.emplace === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_get', (has) => has.map_prototype && typeof Map.prototype.get === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_has', (has) => has.map_prototype && typeof Map.prototype.has === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_set', (has) => has.map_prototype && typeof Map.prototype.set === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_foreach', (has) => has.map_prototype && typeof Map.prototype.forEach === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_entries', (has) => has.map_prototype && typeof Map.prototype.entries === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_keys', (has) => has.map_prototype && typeof Map.prototype.keys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('map_values', (has) => has.map_prototype && typeof Map.prototype.values === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math', () => typeof Math === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_abs', (has) => has.math && typeof Math.abs === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_acos', (has) => has.math && typeof Math.acos === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_acosh', (has) => has.math && typeof Math.acosh === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_asin', (has) => has.math && typeof Math.asin === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_asinh', (has) => has.math && typeof Math.asinh === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_atan', (has) => has.math && typeof Math.atan === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_atan2', (has) => has.math && typeof Math.atan2 === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_atanh', (has) => has.math && typeof Math.atanh === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_cbrt', (has) => has.math && typeof Math.cbrt === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_ceil', (has) => has.math && typeof Math.ceil === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_clz32', (has) => has.math && typeof Math.clz32 === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_cos', (has) => has.math && typeof Math.cos === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_cosh', (has) => has.math && typeof Math.cosh === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_exp', (has) => has.math && typeof Math.exp === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_expm1', (has) => has.math && typeof Math.expm1 === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_floor', (has) => has.math && typeof Math.floor === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_fround', (has) => has.math && typeof Math.fround === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_hypot', (has) => has.math && typeof Math.hypot === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_imul', (has) => has.math && typeof Math.imul === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_log', (has) => has.math && typeof Math.log === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_log1p', (has) => has.math && typeof Math.log1p === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_log2', (has) => has.math && typeof Math.log2 === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_log10', (has) => has.math && typeof Math.log10 === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_max', (has) => has.math && typeof Math.max === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_min', (has) => has.math && typeof Math.min === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_pow', (has) => has.math && typeof Math.pow === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_random', (has) => has.math && typeof Math.random === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_round', (has) => has.math && typeof Math.round === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_sign', (has) => has.math && typeof Math.sign === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_sin', (has) => has.math && typeof Math.sin === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_sinh', (has) => has.math && typeof Math.sinh === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_sqrt', (has) => has.math && typeof Math.sqrt === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_tan', (has) => has.math && typeof Math.tan === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_tanh', (has) => has.math && typeof Math.tanh === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('math_trunc', (has) => has.math && typeof Math.trunc === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number', () => typeof Number === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_epsilon', (has) => has.number && typeof Number.EPSILON === 'number');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_isfinite', (has) => has.number && typeof Number.isFinite === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_isinteger', (has) => has.number && typeof Number.isInteger === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_isnan', (has) => has.number && typeof Number.isNaN === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_issafeinteger', (has) => has.number && typeof Number.isSafeInteger === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_max_safe_integer', (has) => has.number && typeof Number.MAX_SAFE_INTEGER === 'number');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_min_safe_integer', (has) => has.number && typeof Number.MIN_SAFE_INTEGER === 'number');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_parsefloat', (has) => has.number && typeof Number.parseFloat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_parseint', (has) => has.number && typeof Number.parseInt === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_range', (has) => has.number && typeof Number.range === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_tointeger', (has) => has.number && typeof Number.toInteger === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_prototype', (has) => has.number && typeof Number.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_clz', (has) => has.number_prototype && typeof Number.prototype.clz === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'number_toexponential',
        (has) => has.number_prototype && typeof Number.prototype.toExponential === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('number_tofixed', (has) => has.number_prototype && typeof Number.prototype.toFixed === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'number_toprecision',
        (has) => has.number_prototype && typeof Number.prototype.toPrecision === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object', () => typeof Object === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_assign', (has) => has.object && typeof Object.assign === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_create', (has) => has.object && typeof Object.create === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_defineproperty', (has) => has.object && typeof Object.defineProperty === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_defineproperties', (has) => has.object && typeof Object.defineProperties === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_entries', (has) => has.object && typeof Object.entries === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_freeze', (has) => has.object && typeof Object.freeze === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_fromentries', (has) => has.object && typeof Object.fromEntries === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'object_getownpropertydescriptor',
        (has) => has.object && typeof Object.getOwnPropertyDescriptor === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'object_getownpropertydescriptors',
        (has) => has.object && typeof Object.getOwnPropertyDescriptors === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'object_getownpropertynames',
        (has) => has.object && typeof Object.getOwnPropertyNames === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'object_getownpropertysymbols',
        (has) => has.object && typeof Object.getOwnPropertySymbols === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_getpropertynames', (has) => has.object && typeof Object.getPropertyNames === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_getprototypeof', (has) => has.object && typeof Object.getPrototypeOf === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_is', (has) => has.object && typeof Object.is === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_isextensible', (has) => has.object && typeof Object.isExtensible === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_isfrozen', (has) => has.object && typeof Object.isFrozen === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_issealed', (has) => has.object && typeof Object.isSealed === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_keys', (has) => has.object && typeof Object.keys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_preventextensions', (has) => has.object && typeof Object.preventExtensions === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_seal', (has) => has.object && typeof Object.seal === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_setprototypeof', (has) => has.object && typeof Object.setPrototypeOf === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_values', (has) => has.object && typeof Object.values === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_prototype', (has) => has.object && typeof Object.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('object_eval', (has) => has.object_prototype && typeof Object.prototype.eval === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('parsefloat', () => typeof parseFloat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('parseint', () => typeof parseInt === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise', () => typeof Promise === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_all', (has) => has.promise && typeof Promise.all === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_allsettled', (has) => has.promise && typeof Promise.allSettled === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_any', (has) => has.promise && typeof Promise.any === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_race', (has) => has.promise && typeof Promise.race === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_reject', (has) => has.promise && typeof Promise.reject === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_resolve', (has) => has.promise && typeof Promise.resolve === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_prototype', (has) => has.promise && typeof Promise.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_catch', (has) => has.promise_prototype && typeof Promise.prototype.catch === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'promise_finally',
        (has) => has.promise_prototype && typeof Promise.prototype.finally === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('promise_then', (has) => has.promise_prototype && typeof Promise.prototype.then === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('proxy', () => typeof Proxy === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('queuemicrotask', () => typeof queueMicrotask === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp', () => typeof RegExp === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_prototype', (has) => has.regexp && typeof RegExp.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_compile', (has) => has.regexp_prototype && typeof RegExp.prototype.compile === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_exec', (has) => has.regexp_prototype && typeof RegExp.prototype.exec === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_flags', (has) => has.regexp_prototype && typeof RegExp.prototype.flags === 'string');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_match', (has) => has.regexp_prototype && typeof RegExp.prototype.match === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_replace', (has) => has.regexp_prototype && typeof RegExp.prototype.replace === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_search', (has) => has.regexp_prototype && typeof RegExp.prototype.search === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_split', (has) => has.regexp_prototype && typeof RegExp.prototype.split === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('regexp_test', (has) => has.regexp_prototype && typeof RegExp.prototype.test === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect', () => typeof Reflect === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_apply', (has) => has.reflect && typeof Reflect.apply === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_construct', (has) => has.reflect && typeof Reflect.construct === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_definemetadata', (has) => has.reflect && typeof Reflect.defineMetadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_defineproperty', (has) => has.reflect && typeof Reflect.defineProperty === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_deletemetadata', (has) => has.reflect && typeof Reflect.deleteMetadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_deleteproperty', (has) => has.reflect && typeof Reflect.deleteProperty === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_get', (has) => has.reflect && typeof Reflect.get === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_getmetadata', (has) => has.reflect && typeof Reflect.getMetadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_getmetadatakeys', (has) => has.reflect && typeof Reflect.getMetadataKeys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_getownmetadata', (has) => has.reflect && typeof Reflect.getOwnMetadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'reflect_getownmetadatakeys',
        (has) => has.reflect && typeof Reflect.getOwnMetadataKeys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'reflect_getownpropertydescriptor',
        (has) => has.reflect && typeof Reflect.getOwnPropertyDescriptor === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_getprototypeof', (has) => has.reflect && typeof Reflect.getPrototypeOf === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_has', (has) => has.reflect && typeof Reflect.has === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_hasmetadata', (has) => has.reflect && typeof Reflect.hasMetadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_hasownmetadata', (has) => has.reflect && typeof Reflect.hasOwnMetadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_isextensible', (has) => has.reflect && typeof Reflect.isExtensible === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_metadata', (has) => has.reflect && typeof Reflect.metadata === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_ownkeys', (has) => has.reflect && typeof Reflect.ownKeys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'reflect_preventextensions',
        (has) => has.reflect && typeof Reflect.preventExtensions === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_set', (has) => has.reflect && typeof Reflect.set === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('reflect_setprototypeof', (has) => has.reflect && typeof Reflect.setPrototypeOf === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set', () => typeof Set === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_prototype', (has) => has.set && typeof Set.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_add', (has) => has.set_prototype && typeof Set.prototype.add === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_clear', (has) => has.set_prototype && typeof Set.prototype.clear === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_delete', (has) => has.set_prototype && typeof Set.prototype.delete === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_has', (has) => has.set_prototype && typeof Set.prototype.has === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_foreach', (has) => has.set_prototype && typeof Set.prototype.forEach === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_entries', (has) => has.set_prototype && typeof Set.prototype.entries === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_keys', (has) => has.set_prototype && typeof Set.prototype.keys === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('set_values', (has) => has.set_prototype && typeof Set.prototype.values === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('sharedarraybuffer', () => typeof SharedArrayBuffer === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'sharedarraybuffer_prototype',
        (has) => has.sharedarraybuffer && typeof SharedArrayBuffer.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'sharedarraybuffer_bytelength',
        (has) => has.sharedarraybuffer_prototype && typeof SharedArrayBuffer.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'sharedarraybuffer_slice',
        (has) => has.sharedarraybuffer_prototype && typeof SharedArrayBuffer.prototype.slice === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string', () => typeof String === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_fromcharcode', (has) => has.string && typeof String.fromCharCode === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_fromcodepoint', (has) => has.string && typeof String.fromCodePoint === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_raw', (has) => has.string && typeof String.raw === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_prototype', (has) => has.string && typeof String.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_anchor', (has) => has.string_prototype && typeof String.prototype.anchor === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_big', (has) => has.string_prototype && typeof String.prototype.big === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_blink', (has) => has.string_prototype && typeof String.prototype.blink === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_bold', (has) => has.string_prototype && typeof String.prototype.bold === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_charat', (has) => has.string_prototype && typeof String.prototype.charAt === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_charcodeat',
        (has) => has.string_prototype && typeof String.prototype.charCodeAt === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_codepointat',
        (has) => has.string_prototype && typeof String.prototype.codePointAt === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_concat', (has) => has.string_prototype && typeof String.prototype.concat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_contains', (has) => has.string_prototype && typeof String.prototype.contains === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_createhtml',
        (has) => has.string_prototype && typeof String.prototype.createHTML === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_endswith', (has) => has.string_prototype && typeof String.prototype.endsWith === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_fixed', (has) => has.string_prototype && typeof String.prototype.fixed === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_fontcolor',
        (has) => has.string_prototype && typeof String.prototype.fontcolor === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_fontsize', (has) => has.string_prototype && typeof String.prototype.fontsize === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_includes', (has) => has.string_prototype && typeof String.prototype.includes === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_indexof', (has) => has.string_prototype && typeof String.prototype.indexOf === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_italics', (has) => has.string_prototype && typeof String.prototype.italics === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_lastindexof',
        (has) => has.string_prototype && typeof String.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_link', (has) => has.string_prototype && typeof String.prototype.link === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_localecompare',
        (has) => has.string_prototype && typeof String.prototype.localeCompare === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_match', (has) => has.string_prototype && typeof String.prototype.match === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_matchall', (has) => has.string_prototype && typeof String.prototype.matchAll === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_normalize',
        (has) => has.string_prototype && typeof String.prototype.normalize === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_padend', (has) => has.string_prototype && typeof String.prototype.padEnd === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_padstart', (has) => has.string_prototype && typeof String.prototype.padStart === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_quote', (has) => has.string_prototype && typeof String.prototype.quote === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_repeat', (has) => has.string_prototype && typeof String.prototype.repeat === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_replace', (has) => has.string_prototype && typeof String.prototype.replace === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_replaceall',
        (has) => has.string_prototype && typeof String.prototype.replaceAll === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_search', (has) => has.string_prototype && typeof String.prototype.search === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_slice', (has) => has.string_prototype && typeof String.prototype.slice === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_small', (has) => has.string_prototype && typeof String.prototype.small === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_split', (has) => has.string_prototype && typeof String.prototype.split === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_startswith',
        (has) => has.string_prototype && typeof String.prototype.startsWith === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_strike', (has) => has.string_prototype && typeof String.prototype.strike === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_sub', (has) => has.string_prototype && typeof String.prototype.sub === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_substr', (has) => has.string_prototype && typeof String.prototype.substr === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_substring',
        (has) => has.string_prototype && typeof String.prototype.substring === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_sup', (has) => has.string_prototype && typeof String.prototype.sup === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_toarray', (has) => has.string_prototype && typeof String.prototype.toArray === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_tolocalelowercase',
        (has) => has.string_prototype && typeof String.prototype.toLocaleLowerCase === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_tolocaleuppercase',
        (has) => has.string_prototype && typeof String.prototype.toLocaleUpperCase === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_tolowercase',
        (has) => has.string_prototype && typeof String.prototype.toLowerCase === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_touppercase',
        (has) => has.string_prototype && typeof String.prototype.toUpperCase === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_trim', (has) => has.string_prototype && typeof String.prototype.trim === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_trimend', (has) => has.string_prototype && typeof String.prototype.trimEnd === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('string_trimleft', (has) => has.string_prototype && typeof String.prototype.trimLeft === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_trimright',
        (has) => has.string_prototype && typeof String.prototype.trimRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'string_trimstart',
        (has) => has.string_prototype && typeof String.prototype.trimStart === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol', () => typeof Symbol === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_asynciterator', (has) => has.symbol && typeof Symbol.asyncIterator === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_for', (has) => has.symbol && typeof Symbol.for === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_hasinstance', (has) => has.symbol && typeof Symbol.hasInstance === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_isconcatspreadable', (has) => has.symbol && typeof Symbol.isConcatSpreadable === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_iterator', (has) => has.symbol && typeof Symbol.iterator === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_keyfor', (has) => has.symbol && typeof Symbol.keyFor === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_match', (has) => has.symbol && typeof Symbol.match === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_prototype', (has) => has.symbol && typeof Symbol.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_replace', (has) => has.symbol && typeof Symbol.replace === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_search', (has) => has.symbol && typeof Symbol.search === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_species', (has) => has.symbol && typeof Symbol.species === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_split', (has) => has.symbol && typeof Symbol.split === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_toprimitive', (has) => has.symbol && typeof Symbol.toPrimitive === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_tostringtag', (has) => has.symbol && typeof Symbol.toStringTag === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('symbol_unscopables', (has) => has.symbol && typeof Symbol.unscopables === 'symbol');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint8array', () => typeof Uint8Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint8array_from', (has) => has.uint8array && typeof Uint8Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint8array_of', (has) => has.uint8array && typeof Uint8Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint8array_prototype', (has) => has.uint8array && typeof Uint8Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_buffer',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_bytelength',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_byteoffset',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_length',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint8array_at', (has) => has.uint8array_prototype && typeof Uint8Array.prototype.at === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_copywithin',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_every',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_fill',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_filter',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_filterout',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_find',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_findindex',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_includes',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_indexof',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_join',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_lastindexof',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_map',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_reduce',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_reduceright',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_reverse',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_slice',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_some',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_sort',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_foreach',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_entries',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_keys',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8array_values',
        (has) => has.uint8array_prototype && typeof Uint8Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint8arrayclamped', () => typeof Uint8ArrayClamped === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_from',
        (has) => has.uint8arrayclamped && typeof Uint8ArrayClamped.from === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_of',
        (has) => has.uint8arrayclamped && typeof Uint8ArrayClamped.of === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_prototype',
        (has) => has.uint8arrayclamped && typeof Uint8ArrayClamped.prototype === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_buffer',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_bytelength',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_byteoffset',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_length',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_at',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_copywithin',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_every',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_fill',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_filter',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_filterout',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_find',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_findindex',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_includes',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_indexof',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_join',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_lastindexof',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_map',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_reduce',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_reduceright',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_reverse',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_slice',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_some',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_sort',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_foreach',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_entries',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_keys',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint8arrayclamped_values',
        (has) => has.uint8arrayclamped_prototype && typeof Uint8ArrayClamped.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint16array', () => typeof Uint16Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint16array_from', (has) => has.uint16array && typeof Uint16Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint16array_of', (has) => has.uint16array && typeof Uint16Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint16array_prototype', (has) => has.uint16array && typeof Uint16Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_buffer',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_bytelength',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_byteoffset',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_length',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_at',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_copywithin',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_every',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_fill',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_filter',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_filterout',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_find',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_findindex',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_includes',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_indexof',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_join',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_lastindexof',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_map',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_reduce',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_reduceright',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_reverse',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_slice',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_some',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_sort',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_foreach',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_entries',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_keys',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint16array_values',
        (has) => has.uint16array_prototype && typeof Uint16Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint32array', () => typeof Uint32Array === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint32array_from', (has) => has.uint32array && typeof Uint32Array.from === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint32array_of', (has) => has.uint32array && typeof Uint32Array.of === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('uint32array_prototype', (has) => has.uint32array && typeof Uint32Array.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_buffer',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.buffer === 'object'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_bytelength',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.byteLength === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_byteoffset',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.byteOffset === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_length',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.length === 'number'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_at',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.at === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_copywithin',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.copyWithin === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_every',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.every === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_fill',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.fill === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_filter',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.filter === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_filterout',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.filterOut === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_find',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.find === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_findindex',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.findIndex === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_includes',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.includes === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_indexof',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.indexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_join',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.join === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_lastindexof',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.lastIndexOf === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_map',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.map === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_reduce',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.reduce === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_reduceright',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.reduceRight === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_reverse',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.reverse === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_slice',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.slice === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_some',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.some === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_sort',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.sort === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_foreach',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.forEach === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_entries',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.entries === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_keys',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.keys === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'uint32array_values',
        (has) => has.uint32array_prototype && typeof Uint32Array.prototype.values === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakmap', () => typeof WeakMap === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakmap_prototype', (has) => has.weakmap && typeof WeakMap.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakmap_delete', (has) => has.weakmap_prototype && typeof WeakMap.prototype.delete === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector(
        'weakmap_emplace',
        (has) => has.weakmap_prototype && typeof WeakMap.prototype.emplace === 'function'
    );
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakmap_get', (has) => has.weakmap_prototype && typeof WeakMap.prototype.get === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakmap_has', (has) => has.weakmap_prototype && typeof WeakMap.prototype.has === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakmap_set', (has) => has.weakmap_prototype && typeof WeakMap.prototype.set === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakref', () => typeof WeakRef === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakref_prototype', (has) => has.weakref && typeof WeakRef.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakref_deref', (has) => has.weakref_prototype && typeof WeakRef.prototype.deref === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakset', () => typeof WeakSet === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakset_prototype', (has) => has.weakset && typeof WeakSet.prototype === 'object');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakset_add', (has) => has.weakset_prototype && typeof WeakSet.prototype.add === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakset_delete', (has) => has.weakset_prototype && typeof WeakSet.prototype.delete === 'function');
    // @ts-ignore Detecting a feature that may not be supported by TypeScript
    defineDetector('weakset_has', (has) => has.weakset_prototype && typeof WeakSet.prototype.has === 'function');
};
