import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { Level } from '../../src/level';
import { XMLLayout } from '../../src/layouts/xml-layout';

describe('XMLLayout', () => {
    test('it should make instances', () => {
        const layout = new XMLLayout();
        expect(layout).toBeInstanceOf(XMLLayout);
    });

    describe('instances', () => {
        const entry1 = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'layout.pattern.test.unit',
        };
        const entry2 = {
            level: new Level('TWO', 200),
            message: ['This', 'is', 'a', 'another', 'test'] as any[],
            timestamp: new Date('1995-12-17T03:26:00').getTime(),
            category: 'layout.pattern.test.unit',
        };
        let layout: XMLLayout | undefined;

        afterEach(() => {
            layout = undefined;
        });

        beforeEach(() => {
            layout = new XMLLayout();
        });

        test('it should format an entry', () => {
            expect(layout!.format(entry1 as any)).toMatch(
                /<Entry category="layout.pattern.test.unit" level="ONE" timestamp="819188640000"><Message><!\[CDATA\[This is a test\]\]><\/Message><\/Entry>/
            );
        });

        test('it should format a batch of entries', () => {
            expect(layout!.formatBatch([entry1, entry2] as any[])).toMatch(
                /<Entries size="2"><Entry category="layout.pattern.test.unit" level="ONE" timestamp="819188640000"><Message><!\[CDATA\[This is a test\]\]><\/Message><\/Entry><Entry category="layout.pattern.test.unit" level="TWO" timestamp="819188760000"><Message><!\[CDATA\[This is a another test\]\]><\/Message><\/Entry><\/Entries>/
            );
        });

        test('it should format errors', () => {
            expect(layout!.formatError()).toBe('');
            expect(layout!.formatError(new Error('Test Error'))).toBe(
                '<Error name="Error"><![CDATA[Test Error]]></Error>'
            );
        });
    });
});
