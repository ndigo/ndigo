import { Level } from '../../src/level';
import { PatternLayout } from '../../src/layouts/pattern-layout';

describe('PatternLayout', function () {
    test('it should make instances', function () {
        const layout = new PatternLayout('foo %d');
        expect(layout).toBeInstanceOf(PatternLayout);
    });

    context('instances', function () {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'],
            timestamp: new Date('1995-12-17T03:24:00'),
            category: 'layout.pattern.test.unit',
        };
        let layout;

        afterEach(function () {
            layout = undefined;
        });

        test('it should format entry category', function () {
            layout = new PatternLayout('%c');
            expect(layout.format(entry)).to.match(/^layout\.pattern\.test\.unit$/);
        });

        test('it should format entry category with a format specifier', function () {
            layout = new PatternLayout('%c{2}');
            expect(layout.format(entry)).to.match(/^test\.unit$/);
            layout = new PatternLayout('%c{5}');
            expect(layout.format(entry)).to.match(/^layout\.pattern\.test\.unit$/);
        });

        test('it should format entry level', function () {
            layout = new PatternLayout('%p');
            expect(layout.format(entry)).to.match(/^ONE$/);
        });

        test('it should format entry message', function () {
            layout = new PatternLayout('%m');
            expect(layout.format(entry)).to.match(/^This is a test$/);
        });

        test('it should format entry timestamp', function () {
            layout = new PatternLayout('%d');
            expect(layout.format(entry)).to.match(/^1995\-12\-17T03:24:00\-05:00$/);
        });

        test('it should format entry timestamp with a format specifier', function () {
            layout = new PatternLayout('%d{EEEE, MMMM do yyyy, h:mm a}');
            expect(layout.format(entry)).to.match(/^Sunday, December 17th 1995, 3:24 AM$/);
        });

        test('it should ignore invalid directives', function () {
            layout = new PatternLayout('%z');
            expect(layout.format(entry)).to.match(/^z$/);
        });

        test('it should render regular characters', function () {
            layout = new PatternLayout('foo');
            expect(layout.format(entry)).to.match(/^foo$/);
        });

        test('it should render newline characters', function () {
            layout = new PatternLayout('%n');
            expect(layout.format(entry)).to.match(/^\r\n$/);
        });

        test('it should render % characters', function () {
            layout = new PatternLayout('%%');
            expect(layout.format(entry)).to.match(/^%$/);
        });

        test('it should truncate values', function () {
            layout = new PatternLayout('%.2p');
            expect(layout.format(entry)).to.match(/^NE$/);
        });

        test('it should left pad values', function () {
            layout = new PatternLayout('%5p');
            expect(layout.format(entry)).to.match(/^\s{2}ONE$/);
        });

        test('it should right pad values', function () {
            layout = new PatternLayout('%-5p');
            expect(layout.format(entry)).to.match(/^ONE\s{2}$/);
        });
    });
});
