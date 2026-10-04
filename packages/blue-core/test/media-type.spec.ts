/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import MediaType, { parseMediaType } from '../src/media-type';
import * as MediaTypes from '../src/media-types';

describe('MediaType', () => {
    const audioBasicType = new MediaType('audio', 'basic'),
        audioWaveType = new MediaType('audio', 'wave'),
        audioType = new MediaType('audio'),
        audio03Type = new MediaType('audio', '*', { q: '0.3' }),
        audio07Type = new MediaType('audio', '*', { q: '0.7' }),
        audioBasicLevelType = new MediaType('audio', 'basic', { level: '1' }),
        allXmlType = new MediaType('application', '*+xml'),
        textHtmlType = MediaTypes.TEXT_HTML,
        wildcardType = MediaTypes.WILDCARD;

    test('it should default to wild cards', () => {
        const wildcardType = new MediaType(),
            wildcard = '*/*';

        expect(wildcardType).toHaveProperty('type', '*');
        expect(wildcardType).toHaveProperty('subtype', '*');
        expect(wildcardType).toHaveProperty('suffix', null);
        expect(wildcardType).toHaveProperty('facets');
        expect(wildcardType.facets).toEqual(['*']);
        expect(wildcardType).toHaveProperty('parameters');
        expect(wildcardType.parameters).toEqual({});
        expect(wildcardType).toHaveProperty('vendor', false);
        expect(wildcardType).toHaveProperty('personal', false);
        expect(wildcardType).toHaveProperty('experimental', false);

        expect(wildcard).toBe(wildcardType.toJSON());
        expect(wildcard).toBe(wildcardType.toString());
        expect(wildcard).toBe('' + wildcardType);
    });

    test('it should support parameters', () => {
        const parameters = { charset: 'UTF-8' },
            textHtmlType = new MediaType('text', 'html', parameters),
            textHtml = 'text/html;charset=UTF-8';

        expect(textHtmlType).toHaveProperty('type', 'text');
        expect(textHtmlType).toHaveProperty('subtype', 'html');
        expect(textHtmlType).toHaveProperty('suffix', null);
        expect(textHtmlType).toHaveProperty('facets');
        expect(textHtmlType.facets).toEqual(['html']);
        expect(textHtmlType).toHaveProperty('parameters', parameters);
        expect(textHtmlType).toHaveProperty('vendor', false);
        expect(textHtmlType).toHaveProperty('personal', false);
        expect(textHtmlType).toHaveProperty('experimental', false);

        expect(textHtml).toBe(textHtmlType.toJSON());
        expect(textHtml).toBe(textHtmlType.toString());
        expect(textHtml).toBe('' + textHtmlType);
    });

    test('it should support suffixes', () => {
        const applicationAtomType = new MediaType('application', 'atom+xml'),
            applicationAtom = 'application/atom+xml';

        expect(applicationAtomType).toHaveProperty('type', 'application');
        expect(applicationAtomType).toHaveProperty('subtype', 'atom');
        expect(applicationAtomType).toHaveProperty('suffix', 'xml');
        expect(applicationAtomType).toHaveProperty('facets');
        expect(applicationAtomType.facets).toEqual(['atom']);
        expect(applicationAtomType).toHaveProperty('parameters');
        expect(applicationAtomType.parameters).toEqual({});
        expect(applicationAtomType).toHaveProperty('vendor', false);
        expect(applicationAtomType).toHaveProperty('personal', false);
        expect(applicationAtomType).toHaveProperty('experimental', false);

        expect(applicationAtom).toBe(applicationAtomType.toJSON());
        expect(applicationAtom).toBe(applicationAtomType.toString());
        expect(applicationAtom).toBe('' + applicationAtomType);
    });

    test('it should support facets', () => {
        const applicationExcelType = new MediaType('application', 'vnd.ms-excel'),
            applicationExcel = 'application/vnd.ms-excel';

        expect(applicationExcelType).toHaveProperty('type', 'application');
        expect(applicationExcelType).toHaveProperty('subtype', 'vnd.ms-excel');
        expect(applicationExcelType).toHaveProperty('suffix', null);
        expect(applicationExcelType).toHaveProperty('facets');
        expect(applicationExcelType.facets).toEqual(['vnd', 'ms-excel']);
        expect(applicationExcelType).toHaveProperty('parameters');
        expect(applicationExcelType.parameters).toEqual({});
        expect(applicationExcelType).toHaveProperty('vendor', true);
        expect(applicationExcelType).toHaveProperty('personal', false);
        expect(applicationExcelType).toHaveProperty('experimental', false);

        expect(applicationExcel).toBe(applicationExcelType.toJSON());
        expect(applicationExcel).toBe(applicationExcelType.toString());
        expect(applicationExcel).toBe('' + applicationExcelType);
    });

    test('it should add charset', () => {
        const textHtmlType = new MediaType('text', 'html'),
            textHtml = 'text/html',
            textHtmlWithCharsetType = textHtmlType.withCharset('UTF-8'),
            textHtmlWithCharset = 'text/html;charset=UTF-8';

        expect(textHtmlType).toHaveProperty('type', 'text');
        expect(textHtmlType).toHaveProperty('subtype', 'html');
        expect(textHtmlType).toHaveProperty('suffix', null);
        expect(textHtmlType).toHaveProperty('facets');
        expect(textHtmlType.facets).toEqual(['html']);
        expect(textHtmlType).toHaveProperty('parameters');
        expect(textHtmlType).toHaveProperty('vendor', false);
        expect(textHtmlType).toHaveProperty('personal', false);
        expect(textHtmlType).toHaveProperty('experimental', false);

        expect(textHtml).toBe(textHtmlType.toJSON());
        expect(textHtml).toBe(textHtmlType.toString());
        expect(textHtml).toBe('' + textHtmlType);

        expect(textHtmlWithCharsetType).toHaveProperty('type', 'text');
        expect(textHtmlWithCharsetType).toHaveProperty('subtype', 'html');
        expect(textHtmlWithCharsetType).toHaveProperty('suffix', null);
        expect(textHtmlWithCharsetType).toHaveProperty('facets');
        expect(textHtmlWithCharsetType.facets).toEqual(['html']);
        expect(textHtmlWithCharsetType).toHaveProperty('parameters');
        expect(textHtmlWithCharsetType.parameters).toEqual({ charset: 'UTF-8' });
        expect(textHtmlWithCharsetType).toHaveProperty('vendor', false);
        expect(textHtmlWithCharsetType).toHaveProperty('personal', false);
        expect(textHtmlWithCharsetType).toHaveProperty('experimental', false);

        expect(textHtmlWithCharset).toBe(textHtmlWithCharsetType.toJSON());
        expect(textHtmlWithCharset).toBe(textHtmlWithCharsetType.toString());
        expect(textHtmlWithCharset).toBe('' + textHtmlWithCharsetType);
    });

    test('it should be comparable', () => {
        const mt1 = new MediaType('text', 'html'),
            mt2 = new MediaType('text', 'html'),
            mt3 = new MediaType('text', 'xml');

        expect(mt1.compareTo(mt2)).toBe(0);
        expect(mt1.compareTo(mt3)).toBe(-1);
        expect(mt3.compareTo(mt1)).toBe(1);

        // Because numerical strings are funny in JavaScript...
        expect(mt1.withCharset('UTF-8').compareTo(mt1.withCharset('UTF-16'))).toBe(1);

        expect(mt1.equals(mt2)).toBe(true);
        expect(mt1.equals(mt3)).toBe(false);
    });

    test('it should be matchable', () => {
        const mt1 = new MediaType('text', '*'),
            mt2 = new MediaType('text', 'html'),
            mt3 = new MediaType('text', 'xml'),
            mt4 = new MediaType('*', '*');

        expect(mt1.matches(mt2)).toBe(true);
        expect(mt1.matches(mt3)).toBe(true);
        expect(mt2.matches(mt3)).toBe(false);
        expect(mt2.matches(mt4)).toBe(true);
    });

    test('it should be includable', () => {
        const allTextType = new MediaType('text'),
            applicationSoapXmlType = new MediaType('application', 'soap+xml'),
            applicationWildcardXmlType = new MediaType('application', '*+xml'),
            suffixXmlType = new MediaType('application', 'x.y+z+xml');

        expect(textHtmlType.includes(textHtmlType)).toBe(true);
        expect(allTextType.includes(textHtmlType)).toBe(true);
        expect(textHtmlType.includes(allTextType)).toBe(false);

        expect(applicationSoapXmlType.includes(applicationSoapXmlType)).toBe(true);
        expect(applicationWildcardXmlType.includes(applicationWildcardXmlType)).toBe(true);
        expect(applicationWildcardXmlType.includes(suffixXmlType)).toBe(true);
        expect(applicationWildcardXmlType.includes(applicationSoapXmlType)).toBe(true);

        expect(applicationSoapXmlType.includes(applicationWildcardXmlType)).toBe(false);
        expect(suffixXmlType.includes(applicationWildcardXmlType)).toBe(false);
    });

    test('it should parse media type strings', () => {
        const textHtml = 'text/html',
            textHtmlType = MediaType.for(textHtml);

        expect(textHtmlType).toHaveProperty('type', 'text');
        expect(textHtmlType).toHaveProperty('subtype', 'html');
        expect(textHtmlType).toHaveProperty('suffix', null);
        expect(textHtmlType).toHaveProperty('facets');
        expect(textHtmlType.facets).toEqual(['html']);
        expect(textHtmlType).toHaveProperty('parameters');
        expect(textHtmlType).toHaveProperty('vendor', false);
        expect(textHtmlType).toHaveProperty('personal', false);
        expect(textHtmlType).toHaveProperty('experimental', false);
    });

    test('it should compare by specificity', () => {
        const comparator = MediaType.specificityComparator;

        // Equal
        expect(comparator.compare(audioBasicType, audioBasicType)).toBe(0);
        expect(comparator.compare(audioType, audioType)).toBe(0);
        expect(comparator.compare(audio07Type, audio07Type)).toBe(0);
        expect(comparator.compare(audio03Type, audio03Type)).toBe(0);
        expect(comparator.compare(audioBasicLevelType, audioBasicLevelType)).toBe(0);

        // Specific to Generic
        expect(comparator.compare(audioBasicType, audioType)).toBe(-1);
        expect(comparator.compare(audioBasicType, wildcardType)).toBe(-1);
        expect(comparator.compare(audioType, wildcardType)).toBe(-1);
        expect(comparator.compare(MediaTypes.APPLICATION_XHTML, allXmlType)).toBe(-1);

        // Generic to Specific
        expect(comparator.compare(audioType, audioBasicType)).toBe(1);
        expect(comparator.compare(allXmlType, MediaTypes.APPLICATION_XHTML)).toBe(1);
        expect(comparator.compare(wildcardType, audioBasicType)).toBe(1);
        expect(comparator.compare(wildcardType, audioType)).toBe(1);

        // Parameters
        expect(comparator.compare(audioBasicType, audioBasicLevelType)).toBe(1);
        expect(comparator.compare(audioBasicLevelType, audioBasicType)).toBe(-1);

        // Different Types
        expect(comparator.compare(audioBasicType, textHtmlType)).toBe(0);
        expect(comparator.compare(textHtmlType, audioBasicType)).toBe(0);

        // Different Subtypes
        expect(comparator.compare(audioBasicType, audioWaveType)).toBe(0);
        expect(comparator.compare(audioWaveType, audioBasicType)).toBe(0);
    });

    test('it should compare by quality', () => {
        const comparator = MediaType.qualityFactorComparator;

        // Qualifiers
        expect(comparator.compare(audioType, audio07Type)).toBe(-1);
        expect(comparator.compare(audio07Type, audioType)).toBe(1);
        expect(comparator.compare(audio07Type, audio03Type)).toBe(-1);
        expect(comparator.compare(audio03Type, audio07Type)).toBe(1);
        expect(comparator.compare(audio03Type, wildcardType)).toBe(1);
        expect(comparator.compare(wildcardType, audio03Type)).toBe(-1);
    });

    test('sorts by descending quality before wildcard and parameter specificity', () => {
        const expressions = [
            'audio/basic;level=1;q=0.4',
            '*/*;q=0.8',
            'audio/basic;q=0.8',
            'audio/basic;level=1;q=0.8',
            'audio/*;q=0.8',
        ];
        const sorted = expressions.map((expression) => MediaType.for(expression)).sort(MediaType.qualityFactorComparator.compare);
        expect(sorted.map((mediaType) => mediaType.toString())).toEqual([
            'audio/basic;level=1;q=0.8',
            'audio/basic;q=0.8',
            'audio/*;q=0.8',
            '*/*;q=0.8',
            'audio/basic;level=1;q=0.4',
        ]);
    });

    test('retains input order for equal-quality unrelated types and subtypes', () => {
        const expressions = ['text/plain;q=0.8', 'audio/wave;q=0.8', 'audio/basic;q=0.8'];
        const sorted = expressions.map((expression) => MediaType.for(expression)).sort(MediaType.qualityFactorComparator.compare);
        expect(sorted.map((mediaType) => mediaType.toString())).toEqual(expressions);
    });

    test('it should provide a custom toString tag', () => {
        const parameters = { charset: 'UTF-8' },
            textHtmlType = new MediaType('text', 'html', parameters);

        expect(Object.prototype.toString.call(textHtmlType)).toBe('[object MediaType:text/html;charset=UTF-8]');
    });

    test('it should provide baseType', () => {
        expect(MediaTypes.TEXT_HTML.baseType).toBe('text/html');
        expect(MediaType.for('application/atom+xml').baseType).toBe('application/atom');
        expect(MediaType.for('application/json;charset=utf-8').baseType).toBe('application/json');
    });

    test('it should provide default charset', () => {
        expect(MediaTypes.TEXT_HTML.getDefaultCharset()).toBe('utf-8');
        expect(MediaTypes.APPLICATION_JSON.getDefaultCharset()).toBe('utf-8');
        expect(MediaTypes.IMAGE_PNG.getDefaultCharset()).toBe(null);
    });

    test('it should format for Content-Type header', () => {
        expect(MediaTypes.TEXT_HTML.toContentType()).toBe('text/html;charset=utf-8');
        expect(MediaTypes.APPLICATION_JSON.toContentType()).toBe('application/json;charset=utf-8');
        expect(MediaTypes.IMAGE_PNG.toContentType()).toBe('image/png');

        // Should respect existing charset
        expect(MediaType.for('text/html;charset=ISO-8859-1').toContentType()).toBe('text/html;charset=ISO-8859-1');

        // Should support opt-out
        expect(MediaTypes.TEXT_HTML.toContentType({ autoCharset: false })).toBe('text/html');
    });

    test('it should fix withCharset bug and preserve parameters', () => {
        const mt = MediaType.for('multipart/form-data;boundary=abc123');
        const withCharset = mt.withCharset('utf-8');
        expect(withCharset.toString()).toBe('multipart/form-data;boundary=abc123;charset=utf-8');
        expect(withCharset.parameters).toEqual({ boundary: 'abc123', charset: 'utf-8' });
    });
});

describe('parseMediaType', () => {
    test('should parse basic media type', () => {
        const mt = parseMediaType('text/html');
        expect(mt.type).toBe('text');
        expect(mt.subtype).toBe('html');
        expect(mt.parameters).toEqual({});
    });

    test('should parse with parameters', () => {
        const mt = parseMediaType('text/html;charset=UTF-8');
        expect(mt.parameters).toEqual({ charset: 'UTF-8' });
    });

    test('should throw on invalid input', () => {
        expect(() => parseMediaType('')).toThrow();
        expect(() => parseMediaType(null as unknown as string)).toThrow();
    });

    test('should use registry', () => {
        const mt1 = parseMediaType('application/json');
        const mt2 = parseMediaType('application/json');
        expect(mt1).toBe(mt2);
    });
});

describe('MediaType raw-header parsing (Wave 6)', () => {
    test('case variants of type and subtype converge on one interned instance', () => {
        const mixed = MediaType.for('TEXT/HTML');
        const lower = MediaType.for('text/html');
        expect(mixed).toBe(MediaTypes.TEXT_HTML);
        expect(mixed).toBe(lower);
        expect(mixed.baseType).toBe('text/html');
    });

    test('parameter names fold case, values keep their case', () => {
        const mediaType = MediaType.for('text/html; CHARSET=UTF-8');
        expect(mediaType.parameters).toEqual({ charset: 'UTF-8' });
        expect(mediaType.toString()).toBe('text/html;charset=UTF-8');
        expect(MediaType.for('text/html;charset=UTF-8')).toBe(mediaType);
    });

    test('quoted parameter values parse unquoted and serialize quoted', () => {
        const mediaType = MediaType.for('multipart/form-data; BOUNDARY="x y"');
        expect(mediaType.parameters).toEqual({ boundary: 'x y' });
        expect(mediaType.toString()).toBe('multipart/form-data;boundary="x y"');
    });

    test('parameter values containing = survive (first-equals split)', () => {
        const mediaType = MediaType.for('application/x-foo; session=a=b=c');
        expect(mediaType.parameters).toEqual({ session: 'a=b=c' });
    });

    test('quality factors parse from the q parameter', () => {
        expect(MediaType.for('text/html;q=0').qualityFactor).toBe(0);
        expect(MediaType.for('text/html;q=0.5').qualityFactor).toBe(0.5);
    });

    test('isJSON covers bases and +json suffixes', () => {
        expect(MediaTypes.APPLICATION_JSON.isJSON).toBe(true);
        expect(MediaTypes.TEXT_JSON.isJSON).toBe(true);
        expect(MediaType.for('application/problem+json').isJSON).toBe(true);
        expect(MediaTypes.TEXT_HTML.isJSON).toBe(false);
        expect(MediaType.for('application/atom+xml').isJSON).toBe(false);
    });

    test('parseAccept splits, turns bare type tokens into wildcards, and drops empty entries', () => {
        const accepted = MediaType.parseAccept('text/html, , application/json;q=0.5, text, */*;q=0.1');
        expect(accepted.map((mediaType) => mediaType.toString())).toEqual([
            'text/html',
            'application/json;q=0.5',
            'text/*',
            '*/*;q=0.1',
        ]);
        expect(accepted[1].qualityFactor).toBe(0.5);
        expect(MediaType.parseAccept(undefined)).toEqual([]);
        expect(MediaType.parseAccept('')).toEqual([]);
    });
});

describe('MediaType registry round-trip (COR-5 / DSG-1 / DSG-2)', () => {
    test('quoted parameter values containing separators round-trip (COR-5)', () => {
        const values = ['a;b', 'a"b', 'a\\b', 'a,b', 'a"b\\c', 'a\\b;c,d'];
        for (const value of values) {
            const component = MediaType.for('text/html', 'x', { v: value }),
                reparsed = MediaType.for(component.toString());

            expect(reparsed.parameters).toEqual({ v: value });
            expect(reparsed.toString()).toBe(component.toString());
            // Serialized → parse lands on the same interned instance.
            expect(reparsed).toBe(component);
        }
    });

    test('quoted values with quotes and backslashes round-trip through parseAccept (COR-5)', () => {
        const accepted = MediaType.parseAccept(`multipart/form-data;boundary="a\\"b\\\\c", text/html`),
            boundary = accepted[0];

        expect(boundary.parameters).toEqual({ boundary: 'a"b\\c' });
        expect(boundary.toString()).toBe('multipart/form-data;boundary="a\\"b\\\\c"');
        expect(accepted[1].toString()).toBe('text/html');
    });

    test('component form folds type/subtype case and converges with the expression path (DSG-2)', () => {
        expect(MediaType.for('Text', 'HTML')).toBe(MediaTypes.TEXT_HTML);
        expect(MediaType.for('Text', 'HTML').toString()).toBe('text/html');
        expect(MediaType.for('text', 'html')).toBe(MediaTypes.TEXT_HTML);

        const problemJson = MediaType.for('APPLICATION', 'Problem+JSON'),
            problemJsonExpression = MediaType.for('application/problem+json');
        expect(problemJson.isJSON).toBe(true);
        expect(problemJsonExpression.isJSON).toBe(true);
        expect(problemJson).toBe(problemJsonExpression);
        expect(problemJson.toString()).toBe('application/problem+json');
    });

    test('component form folds parameter names and preserves parameter values (DSG-2)', () => {
        const component = MediaType.for('Text', 'HTML', { Charset: 'UTF-8' }),
            expression = MediaType.for('text/html;CHARSET=UTF-8');

        expect(component.parameters).toEqual({ charset: 'UTF-8' });
        expect(component.toString()).toBe('text/html;charset=UTF-8');
        expect(component).toBe(expression);
        expect(component).toBe(MediaType.for('text/html;charset=UTF-8'));
    });

    test('parameter order is canonicalized before keying and comparison (DSG-1)', () => {
        const first = MediaType.for('text/html;charset=utf-8;x=1'),
            second = MediaType.for('text/html;x=1;charset=utf-8');

        expect(second).toBe(first);
        expect(first.compareTo(second)).toBe(0);
        expect(second.compareTo(first)).toBe(0);
        expect(second.toString()).toBe('text/html;charset=utf-8;x=1');
        expect(second.toString()).toBe(first.toString());
    });

    test('parameterized expressions do not accumulate registry entries unboundedly (DSG-1)', () => {
        const baseline = MediaType.registrySize;

        for (let index = 0; index < 300; index++) {
            MediaType.for(`text/html;x=${index};y=${index}`);
            MediaType.parseAccept(`text/html;q=0.5;r=${index}, text/plain`);
        }
        const afterFirstBatch = MediaType.registrySize;
        expect(afterFirstBatch).toBeLessThan(baseline + 300);

        for (let index = 300; index < 600; index++) {
            MediaType.for(`text/html;x=${index};y=${index}`);
            MediaType.parseAccept(`text/html;q=0.5;r=${index}`);
        }
        // The FIFO cache evicts oldest entries once full, so the registry
        // size stays constant under continued unique parameterized input.
        expect(MediaType.registrySize).toBe(afterFirstBatch);
    });

    test('parameterless parse-originated expressions are bounded; constants stay process-lifetime (SEC-7)', () => {
        const baseline = MediaType.registrySize,
            firstInstance = MediaType.for('a/0');

        for (let index = 0; index < 5000; index++) {
            MediaType.for(`a/${index}`);
            MediaType.parseAccept(`b/${index}, c/${index}`);
        }
        const afterFirstBatch = MediaType.registrySize;

        for (let index = 5000; index < 10000; index++) {
            MediaType.for(`a/${index}`);
            MediaType.parseAccept(`b/${index}, c/${index}`);
        }

        // Both parse paths (for/parseAccept) are capped FIFOs: 10k distinct
        // parameterless expressions cannot grow the registry past the bound.
        expect(MediaType.registrySize).toBe(afterFirstBatch);
        expect(MediaType.registrySize).toBeLessThan(baseline + 10000);

        // The earliest entry was evicted — re-interning yields a fresh
        // instance — while a recent one is still the cached instance.
        expect(MediaType.for('a/0')).not.toBe(firstInstance);
        const recent = MediaType.for('a/9999');
        expect(MediaType.for('a/9999')).toBe(recent);

        // Registered constants are exempt: process-lifetime via registered().
        expect(MediaType.for('application/json')).toBe(MediaTypes.APPLICATION_JSON);
        expect(MediaType.for('text/html')).toBe(MediaTypes.TEXT_HTML);
    });

    test('garbage type tokens are rejected, not interned as wildcard entries (COR-6)', () => {
        expect(MediaType.for(' /foo')).toBeNull();
        expect(MediaType.for('a;b')).toBeNull();
        expect(MediaType.for('a b/c')).toBeNull(); // whitespace inside a type token
        expect(MediaType.for('image/jpeg')).not.toBeNull(); // clean tokens still parse
        expect(MediaType.for('')).toBeNull();
        expect(MediaType.for('   ')).toBeNull();
    });

    test('type-only expressions trim, fold case, and converge (COR-6)', () => {
        expect(MediaType.for(' JPEG').toString()).toBe('jpeg/*');
        expect(MediaType.for('JPEG')).toBe(MediaType.for('jpeg'));
    });

    test('malformed quality factors fall back to 1, never NaN/exclusion (COR-7)', () => {
        const malformed = MediaType.for('text/html;q=abc');
        expect(Number.isFinite(malformed.qualityFactor)).toBe(true);
        expect(malformed.qualityFactor).toBe(1);
        expect(MediaType.for('text/html;q=0.5').qualityFactor).toBe(0.5);
        expect(MediaType.for('text/html;q=0').qualityFactor).toBe(0);
        expect(MediaType.for('text/html').qualityFactor).toBe(1);

        const accepted = MediaType.parseAccept('text/html;q=abc, application/json;q=0');
        expect(accepted).toHaveLength(2);
        expect(accepted[0].qualityFactor).toBe(1);
        expect(accepted[1].qualityFactor).toBe(0);
    });
});
