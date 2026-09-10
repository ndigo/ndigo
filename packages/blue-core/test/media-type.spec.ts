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
