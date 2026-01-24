import { describe, test, expect, afterEach } from 'vitest';
import { Level } from '../../src/level';
import { PatternLayout } from '../../src/layouts/pattern-layout';

describe('PatternLayout', () => {
    test('it should make instances', () => {
        const layout = new PatternLayout('foo %d');
        expect(layout).toBeInstanceOf(PatternLayout);
    });

    describe('instances', () => {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'] as any[],
            timestamp: new Date('1995-12-17T03:24:00'),
            category: 'layout.pattern.test.unit',
        };
        let layout: PatternLayout | undefined;

        afterEach(() => {
            layout = undefined;
        });

        test('it should format entry category', () => {
            layout = new PatternLayout('%c');
            expect(layout.format(entry as any)).toMatch(/^layout\.pattern\.test\.unit$/);
        });

        test('it should format entry category with a format specifier', () => {
            layout = new PatternLayout('%c{2}');
            expect(layout.format(entry as any)).toMatch(/^test\.unit$/);
            layout = new PatternLayout('%c{5}');
            expect(layout.format(entry as any)).toMatch(/^layout\.pattern\.test\.unit$/);
        });

        test('it should format entry level', () => {
            layout = new PatternLayout('%p');
            expect(layout.format(entry as any)).toMatch(/^ONE$/);
        });

        test('it should format entry message', () => {
            layout = new PatternLayout('%m');
            expect(layout.format(entry as any)).toMatch(/^This is a test$/);
        });

        test('it should format entry timestamp', () => {
            layout = new PatternLayout('%d');
            expect(layout.format(entry as any)).toMatch(/^1995\-12\-17 03:24:00$/);
        });

        test('it should format entry timestamp with a format specifier', () => {
            layout = new PatternLayout('%d{EEEE, MMMM do yyyy, h:mm a}');
            expect(layout.format(entry as any)).toMatch(/^Sunday, December 17th 1995, 3:24 AM$/);
        });

        test('it should ignore invalid directives', () => {
            layout = new PatternLayout('%z');
            expect(layout.format(entry as any)).toMatch(/^z$/);
        });

        test('it should render regular characters', () => {
            layout = new PatternLayout('foo');
            expect(layout.format(entry as any)).toMatch(/^foo$/);
        });

        test('it should render newline characters', () => {
            layout = new PatternLayout('%n');
            expect(layout.format(entry as any)).toMatch(/^\r\n$/);
        });

        test('it should render % characters', () => {
            layout = new PatternLayout('%%');
            expect(layout.format(entry as any)).toMatch(/^%$/);
        });

        test('it should truncate values', () => {
            layout = new PatternLayout('%.2p');
            expect(layout.format(entry as any)).toMatch(/^NE$/);
        });

        test('it should left pad values', () => {
            layout = new PatternLayout('%5p');
            expect(layout.format(entry as any)).toMatch(/^\s{2}ONE$/);
        });

        test('it should right pad values', () => {
            layout = new PatternLayout('%-5p');
            expect(layout.format(entry as any)).toMatch(/^ONE\s{2}$/);
        });
    });
});
