import { Level } from '../../src/level';
import { JSONLayout } from '../../src/layouts/json-layout';

describe('JSONLayout', function () {
    test('it should make instances', function () {
        const layout = new JSONLayout();
        expect(layout).toBeInstanceOf(JSONLayout);
    });

    context('instances', function () {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'layout.pattern.test.unit',
        };
        let layout;

        afterEach(function () {
            layout = undefined;
        });

        test('it should format an entry', function () {
            layout = new JSONLayout();
            expect(layout.format(entry)).to.match(
                /{"level":"ONE","message":"This is a test","timestamp":819188640000,"category":"layout.pattern.test.unit"}/
            );
        });

        test('it should format a batch of entries', function () {
            layout = new JSONLayout();
            expect(layout.formatBatch([entry])).to.match(
                /\[{"level":"ONE","message":"This is a test","timestamp":819188640000,"category":"layout.pattern.test.unit"}\]/
            );
        });
    });
});
