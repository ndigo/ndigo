// oxlint-disable no-await-in-loop -- renderTo is awaited sequentially to measure per-render cost.
/**
 * `@ndigo/view` serializing-view throughput.
 *
 * `renderTo(model, route)` (async, whole-document mode) is measured for
 * JSONView and CSVView. The JSONView row compares against `JSON.stringify`
 * doing identical work — the delta is the view wrapper. The CSV floor is a
 * bare template (no quoting/escaping): same shape, less work.
 */
import { test } from 'vitest';
import type { Route } from '@ndigo/router';
import { JSONView } from '../src/json-view';
import { CSVView } from '../src/csv-view';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;
const route = {} as Route;

const model = {
    id: 1234,
    name: 'alice',
    email: 'alice@example.com',
    active: true,
    profile: { city: 'Springfield', zip: '12345', tags: ['a', 'b', 'c'] },
};

const records = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `user-${i}`, city: 'springfield' }));

test('view — JSONView.renderTo vs JSON.stringify', async ({ bench }) => {
    const view = new JSONView();
    const viaView = await view.renderTo(model, route);
    assertEquivalent('json body', viaView.body, JSON.stringify(model));
    await bench.compare(
        bench(benchName('JSONView.renderTo', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) retain((await view.renderTo(model, route)).body);
        }),
        bench(benchName('JSON.stringify (same work)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(JSON.stringify(model));
        })
    );
});

test('view — CSVView.renderTo vs template floor', async ({ bench }) => {
    const view = new CSVView({ columns: ['id', 'name', 'city'] });
    const viaView = await view.renderTo(records, route);
    assertEquivalent('csv starts', (viaView.body as string).startsWith('id,name,city\r\n'), true);
    await bench.compare(
        bench(benchName('CSVView.renderTo (20 rows)', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) retain((await view.renderTo(records, route)).body);
        }),
        bench(benchName('template floor (no escaping)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                let out = 'id,name,city\r\n';
                for (const r of records) out += `${r.id},${r.name},${r.city}\r\n`;
                retain(out);
            }
        })
    );
});

test('view — CSVView single-row vs many-row', async ({ bench }) => {
    const view = new CSVView({ columns: ['id', 'name', 'city'] });
    const small = records.slice(0, 1);
    await bench.compare(
        bench(benchName('CSVView.renderTo (1 row)', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) retain((await view.renderTo(small, route)).body);
        }),
        bench(benchName('CSVView.renderTo (20 rows)', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) retain((await view.renderTo(records, route)).body);
        })
    );
});
