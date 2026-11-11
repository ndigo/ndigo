/**
 * Media-type interning (PR #382's Deque adoption) and the Deque vs array
 * eviction structure.
 *
 * The first two rows exercise the real `parseMediaType` intern path: a
 * repeated-string hit and a distinct-string churn that exceeds the
 * parameterized bound (128), so every insert evicts via `Deque.shift()`
 * (O(1)). The comparator rows wrap an identical FIFO cache — same map
 * set/delete and same parse — the only difference is the order structure:
 * `Array.shift()` (O(n) memmove once tombstones accumulate) vs `Deque.shift`
 * (O(1) ring). That is the before/after of PR #382, rendered like-for-like.
 */
import { test } from 'vitest';
import { parseMediaType } from '../src/media-type';
import { Deque } from '../src/deque';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

const PARAM_LIMIT = 128;
const churnKeys = Array.from({ length: 512 }, (_, i) => `application/vnd.test-${i};v=1`);

function pipelineOne(): { hit: string; churn: readonly string[] } {
    return { hit: 'application/json', churn: churnKeys };
}

test('parseMediaType — intern hit vs churn (PR #382 path)', async ({ bench }) => {
    const { hit, churn } = pipelineOne();
    assertEquivalent('hit', parseMediaType(hit).toString(), 'application/json');
    const churned = churn.map((key) => parseMediaType(key).toString());
    assertEquivalent('churn first', churned[0] as string, churn[0] as string);
    await bench.compare(
        bench(benchName('intern hit', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(parseMediaType(hit));
        }),
        bench(benchName('intern churn (512 keys, evict >128)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(parseMediaType(churn[i % churn.length] as string));
        })
    );
});

test('Deque eviction vs array shift (like-for-like)', async ({ bench }) => {
    // Hand-rolled FIFO caches: identical semantics, only the order structure
    // differs. Serialize a fresh cache per iteration so eviction pressure is
    // steady and both sides do exactly the same work.
    const arrayCache = () => {
        const map = new Map<string, number>();
        const order: string[] = [];
        return (key: string): number => {
            const existing = map.get(key);
            if (existing !== undefined) return existing;
            map.set(key, 1);
            order.push(key);
            if (order.length > PARAM_LIMIT) {
                const oldest = order.shift() as string;
                map.delete(oldest);
            }
            return 1;
        };
    };
    const dequeCache = () => {
        const map = new Map<string, number>();
        const order = new Deque<string>();
        return (key: string): number => {
            const existing = map.get(key);
            if (existing !== undefined) return existing;
            map.set(key, 1);
            order.push(key);
            if (order.length > PARAM_LIMIT) {
                const oldest = order.shift() as string;
                map.delete(oldest);
            }
            return 1;
        };
    };
    const arrayFifo = arrayCache();
    const dequeFifo = dequeCache();
    await bench.compare(
        bench(benchName('array FIFO (shift evict)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(arrayFifo(churnKeys[i % churnKeys.length] as string));
        }),
        bench(benchName('Deque FIFO (shift evict)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(dequeFifo(churnKeys[i % churnKeys.length] as string));
        })
    );
});
