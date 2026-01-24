import { Level } from '../../src/level';
import { XMLLayout } from '../../src/layouts/xml-layout';

describe('XMLLayout', function () {
    test('it should make instances', function () {
        const layout = new XMLLayout();
        expect(layout).toBeInstanceOf(XMLLayout);
    });

    context('instances', function () {
        const entry1 = {
                level: new Level('ONE', 100),
                message: ['This', 'is', 'a', 'test'],
                timestamp: new Date('1995-12-17T03:24:00').getTime(),
                category: 'layout.pattern.test.unit',
            },
            entry2 = {
                level: new Level('TWO', 200),
                message: ['This', 'is', 'a', 'another', 'test'],
                timestamp: new Date('1995-12-17T03:26:00').getTime(),
                category: 'layout.pattern.test.unit',
            };
        let layout;

        afterEach(function () {
            layout = undefined;
        });

        beforeEach(function () {
            layout = new XMLLayout();
        });

        test('it should format an entry', function () {
            expect(layout.format(entry1)).to.match(
                /<Entry category="layout.pattern.test.unit" level="ONE" timestamp="819188640000"><Message><!\[CDATA\[This is a test\]\]><\/Message><\/Entry>/
            );
        });

        test('it should format a batch of entries', function () {
            expect(layout.formatBatch([entry1, entry2])).to.match(
                /<Entries size="2"><Entry category="layout.pattern.test.unit" level="ONE" timestamp="819188640000"><Message><!\[CDATA\[This is a test\]\]><\/Message><\/Entry><Entry category="layout.pattern.test.unit" level="TWO" timestamp="819188760000"><Message><!\[CDATA\[This is a another test\]\]><\/Message><\/Entry><\/Entries>/
            );
        });

        test('it should format errors', function () {
            expect(layout.formatError()).toBe('');
            expect(layout.formatError(new Error('Test Error'))).toBe(
                '<Error name="Error"><![CDATA[Test Error]]></Error>'
            );
        });
    });
});
