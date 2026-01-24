import { describe, test, expect, afterEach } from 'vitest';
import { Level } from '../../src/level';
import { JSONLayout } from '../../src/layouts/json-layout';

describe('JSONLayout', () => {
    test('it should make instances', () => {
        const layout = new JSONLayout();
        expect(layout).toBeInstanceOf(JSONLayout);
    });

    describe('instances', () => {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'layout.pattern.test.unit',
        };
        let layout: JSONLayout | undefined;

        afterEach(() => {
            layout = undefined;
        });

        test('it should format an entry', () => {
            layout = new JSONLayout();
            expect(layout.format(entry)).toMatch(
                /{"level":"ONE","message":"This is a test","timestamp":819188640000,"category":"layout.pattern.test.unit"}/
            );
        });

        test('it should format a batch of entries', () => {
            layout = new JSONLayout();
            expect(layout.formatBatch([entry])).toMatch(
                /\[{"level":"ONE","message":"This is a test","timestamp":819188640000,"category":"layout.pattern.test.unit"}\]/
            );
        });
    });
});
