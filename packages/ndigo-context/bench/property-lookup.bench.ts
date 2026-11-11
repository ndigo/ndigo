/**
 * Benchmark suite for property lookup strategy selection (Phase 0 plan, D6).
 *
 * V8 (Node) only — this bench proves nothing about non-V8 engines; they keep
 * the conservative prototype-chain default (documented in the ADR).
 *
 * Protocol (committed): representative workload = layered config, 8 sources,
 * 25% key overlap, merged >= 100 keys, hit-heavy access mix; median ns/op with
 * outlier trimming. Decision rule: FlatMergedIndex becomes the Node default iff
 * it wins the representative workload by >= 10% median, no matrix cell
 * regresses >= 10%, and the sustained 1%-mutation case stays within margin.
 * Ties go to the prototype chain (today's behavior).
 *
 * Indexes are built ONCE at module level (setup is not part of the measured
 * iteration — the lookup is the hot path, matching context-lookup.bench.ts).
 */

import { test } from 'vitest';
import type { JSONObject } from '@ndigo/core';
import { FlatMergedIndex, PrototypeChainIndex } from '../src/property-resolver';
import type { PropertyIndex } from '../src/property-resolver';
import { wrapSource } from '../src/property-source';
import type { PropertySource } from '../src/property-source';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const retain = sink;

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

function keyedSource(name: string, count: number, offset = 0, overlapWith: string[] = []): PropertySource {
    const data: JSONObject = {};
    for (let i = 0; i < count; i++) {
        const key = `key${i + offset}`;
        data[key] = i;
        if (i % 2 === 0) data[`nested${i + offset}`] = { value: i }; // nested objects
    }
    for (const key of overlapWith) data[key] = name; // deliberate overlap
    return wrapSource(name, data);
}

function layeredSources(sourceCount: number, keysPerSource: number, overlap: number): PropertySource[] {
    const overlapKeys = Array.from({ length: overlap }, (_, i) => `shared${i}`);
    return Array.from({ length: sourceCount }, (_, i) =>
        keyedSource(`s${i}`, keysPerSource, i * keysPerSource, overlapKeys)
    );
}

function built(index: PropertyIndex, sources: PropertySource[]): PropertyIndex {
    index.build(sources);
    return index;
}

/* The representative workload: 8 sources, 25% overlap, merged >= 100 keys. */
const representative = layeredSources(8, 100, 25);
const representativeKeys = Array.from({ length: 100 }, (_, i) => `key${i}`);

const mixedKeys = [...representativeKeys, 'missing', 'nested0.value', 'nested99.value', 'missing.deep.path'];

/* Module-level indexes: built once, lookups only inside the measured body. */
const flat10 = built(new FlatMergedIndex(), layeredSources(2, 10, 0));
const proto10 = built(new PrototypeChainIndex(), layeredSources(2, 10, 0));
const flat100 = built(new FlatMergedIndex(), layeredSources(2, 100, 0));
const proto100 = built(new PrototypeChainIndex(), layeredSources(2, 100, 0));
const flat1000 = built(new FlatMergedIndex(), layeredSources(2, 1000, 0));
const proto1000 = built(new PrototypeChainIndex(), layeredSources(2, 1000, 0));
const flatRep = built(new FlatMergedIndex(), representative);
const protoRep = built(new PrototypeChainIndex(), representative);
const flat32 = built(new FlatMergedIndex(), layeredSources(32, 100, 25));
const proto32 = built(new PrototypeChainIndex(), layeredSources(32, 100, 25));
const flatMix = built(new FlatMergedIndex(), representative);
const protoMix = built(new PrototypeChainIndex(), representative);

for (const key of [...representativeKeys, ...mixedKeys]) {
    assertEquivalent(`property parity ${key}`, flatMix.getProperty(key), protoMix.getProperty(key));
}

/* ------------------------------------------------------------------ */
/*  Flat config (no overlap)                                           */
/* ------------------------------------------------------------------ */

test('flat config', async ({ bench }) => {
    await bench.compare(
        bench(benchName('prototype — 10 keys', 10), () => {
            for (let i = 0; i < 10; i++) retain(proto10.getProperty(`key${i}`));
        }),
        bench(benchName('flat — 10 keys', 10), () => {
            for (let i = 0; i < 10; i++) retain(flat10.getProperty(`key${i}`));
        }),
        bench(benchName('prototype — 100 keys', 100), () => {
            for (let i = 0; i < 100; i++) retain(proto100.getProperty(`key${i}`));
        }),
        bench(benchName('flat — 100 keys', 100), () => {
            for (let i = 0; i < 100; i++) retain(flat100.getProperty(`key${i}`));
        }),
        bench(benchName('prototype — 1,000 keys', 1_000), () => {
            for (let i = 0; i < 1_000; i++) retain(proto1000.getProperty(`key${i}`));
        }),
        bench(benchName('flat — 1,000 keys', 1_000), () => {
            for (let i = 0; i < 1_000; i++) retain(flat1000.getProperty(`key${i}`));
        }),
        { time: 2_000, warmupTime: 500 }
    );
});

/* ------------------------------------------------------------------ */
/*  Layered config (25% overlap)                                       */
/* ------------------------------------------------------------------ */

test('layered config (8 sources, 25% overlap) — representative', async ({ bench }) => {
    await bench.compare(
        bench(benchName('prototype — representative', representativeKeys.length), () => {
            for (const key of representativeKeys) retain(protoRep.getProperty(key));
        }),
        bench(benchName('flat — representative', representativeKeys.length), () => {
            for (const key of representativeKeys) retain(flatRep.getProperty(key));
        })
    );
});

test('layered config (32 sources, 25% overlap)', async ({ bench }) => {
    await bench.compare(
        bench(benchName('prototype — 32 sources', representativeKeys.length), () => {
            for (const key of representativeKeys) retain(proto32.getProperty(key));
        }),
        bench(benchName('flat — 32 sources', representativeKeys.length), () => {
            for (const key of representativeKeys) retain(flat32.getProperty(key));
        })
    );
});

/* ------------------------------------------------------------------ */
/*  Access mix (hit / miss / nested)                                   */
/* ------------------------------------------------------------------ */

test('access mix', async ({ bench }) => {
    await bench.compare(
        bench(benchName('prototype — access mix', mixedKeys.length), () => {
            for (const key of mixedKeys) retain(protoMix.getProperty(key));
        }),
        bench(benchName('flat — access mix', mixedKeys.length), () => {
            for (const key of mixedKeys) retain(flatMix.getProperty(key));
        })
    );
});

/* ------------------------------------------------------------------ */
/*  Mutation cost (sustained 1% mutation — rebuild inside the body)    */
/* ------------------------------------------------------------------ */

test('mutation cost (sustained 1% mutation)', async ({ bench }) => {
    await bench.compare(
        bench(benchName('prototype — lazily invalidated', 100), () => {
            for (let i = 0; i < 100; i++) {
                retain(protoRep.getProperty(`key${i % 100}`)); // 1 lookup
                if (i % 100 === 0) protoRep.build(representative); // 1% rebuild
            }
        }),
        bench(benchName('flat — rebuild on version bump', 100), () => {
            for (let i = 0; i < 100; i++) {
                retain(flatRep.getProperty(`key${i % 100}`));
                if (i % 100 === 0) flatRep.build(representative);
            }
        }),
        { time: 2_000, warmupTime: 500 }
    );
});
