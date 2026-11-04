/**
 * A bounded-concurrency mapper: the small scheduling primitive the HN service
 * hydrates long id lists with.
 *
 * Requests are *issued* in input order (worker 0 takes value 0, worker 1 value
 * 1, …; each worker pulls the next value as it frees up), and the results array
 * mirrors the input order regardless of completion order. That is what keeps
 * the rendered list stable while six item requests are in flight.
 *
 * @module ndigo-hn
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Maps `values` through `map` with at most `limit` calls in flight.
 *
 * @param values - The inputs, in the order results must be returned.
 * @param limit - Maximum concurrent in-flight calls (>= 1).
 * @param map - The async mapper.
 * @returns The mapped results, in input order.
 */
export async function mapConcurrent<T, R>(
    values: readonly T[],
    limit: number,
    map: (value: T, index: number) => Promise<R>
): Promise<R[]> {
    const results = new Array<R>(values.length);
    const size = Math.min(Math.max(1, Math.trunc(limit)), values.length);
    let cursor = 0;

    const worker = async (): Promise<void> => {
        for (;;) {
            const index = cursor;
            cursor += 1;
            if (index >= values.length) {
                return;
            }
            // eslint-disable-next-line no-await-in-loop -- each worker drains its share sequentially; the pool provides the parallelism.
            results[index] = await map(values[index] as T, index);
        }
    };

    await Promise.all(Array.from({ length: size }, worker));
    return results;
}
