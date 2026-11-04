/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import ResponseStatus from '../src/response-status';
import * as ResponseStatuses from '../src/response-statuses';
import { comparableComparison } from '@ndigo/core';

/**
 * RFC 9110 (HTTP Semantics) status codes and canonical reason phrases.
 * Codes that could be ambiguous aliases (e.g. 200) are exact-match asserted;
 * this locks the vocabulary against the standard so a future edit cannot
 * silently drift a reason phrase.
 */
const RFC_REASON_PHRASES: Record<number, string> = {
    // 2xx Success
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    // 3xx Redirection
    300: 'Multiple Choice',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    // 4xx Client Error
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    // 5xx Server Error
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
};

describe('ResponseStatuses — RFC 9110 vocabulary', () => {
    test('reason phrases match the RFC standard table', () => {
        // The namespace export aggregates every named status constant; each is
        // a ResponseStatus carrying its code + reason phrase.
        for (const status of Object.values(ResponseStatuses)) {
            if (!(status instanceof ResponseStatus)) {
                continue;
            }
            const phrase = RFC_REASON_PHRASES[status.code];
            if (phrase) {
                expect(status.text).toBe(phrase);
            }
        }
    });

    test('registry covers every RFC 9110 code in the table', () => {
        const byCode = new Map(
            Object.values(ResponseStatuses)
                .filter((s) => s instanceof ResponseStatus)
                .map((s) => [s.code, s] as const)
        );
        for (const code of Object.keys(RFC_REASON_PHRASES).map(Number)) {
            expect(byCode.has(code)).toBe(true);
        }
        expect(byCode.size).toBeGreaterThan(50);
    });
});

describe('ResponseStatus', () => {
    test('it should create statuses', () => {
        const continueStatus = new ResponseStatus(100, 'Continue');
        const okStatus = new ResponseStatus(200, 'OK');
        const multipleChoiceStatus = new ResponseStatus(300, 'Multiple Choice');
        const badRequestStatus = new ResponseStatus(400, 'Bad Request');
        const internalServerErrorStatus = new ResponseStatus(500, 'Internal Server Error');
        const okJSON = { code: 200, text: 'OK' };
        const okString = '200 OK';

        expect(okStatus).toHaveProperty('code', 200);
        expect(okStatus).toHaveProperty('text', 'OK');
        expect(okStatus.toString()).toBe(okString);
        expect(String(okStatus)).toBe(okString);
        expect(okStatus.toJSON()).toEqual(okJSON);

        expect(continueStatus.isClientErrorClass).toBe(false);
        expect(continueStatus.isInformationClass).toBe(true);
        expect(continueStatus.isRedirectClass).toBe(false);
        expect(continueStatus.isServerErrorClass).toBe(false);
        expect(continueStatus.isSuccessClass).toBe(false);

        expect(okStatus.isClientErrorClass).toBe(false);
        expect(okStatus.isInformationClass).toBe(false);
        expect(okStatus.isRedirectClass).toBe(false);
        expect(okStatus.isServerErrorClass).toBe(false);
        expect(okStatus.isSuccessClass).toBe(true);

        expect(multipleChoiceStatus.isClientErrorClass).toBe(false);
        expect(multipleChoiceStatus.isInformationClass).toBe(false);
        expect(multipleChoiceStatus.isRedirectClass).toBe(true);
        expect(multipleChoiceStatus.isServerErrorClass).toBe(false);
        expect(multipleChoiceStatus.isSuccessClass).toBe(false);

        expect(badRequestStatus.isClientErrorClass).toBe(true);
        expect(badRequestStatus.isInformationClass).toBe(false);
        expect(badRequestStatus.isRedirectClass).toBe(false);
        expect(badRequestStatus.isServerErrorClass).toBe(false);
        expect(badRequestStatus.isSuccessClass).toBe(false);

        expect(internalServerErrorStatus.isClientErrorClass).toBe(false);
        expect(internalServerErrorStatus.isInformationClass).toBe(false);
        expect(internalServerErrorStatus.isRedirectClass).toBe(false);
        expect(internalServerErrorStatus.isServerErrorClass).toBe(true);
        expect(internalServerErrorStatus.isSuccessClass).toBe(false);

        expect(Object.prototype.toString.call(okStatus)).toBe('[object ResponseStatus:200]');
    });

    test('it should return registered statuses', () => {
        const okResponse = new Response(null, { status: 200, statusText: 'OK' });
        const okStatus = ResponseStatus.for(200, 'OK');

        expect(ResponseStatus.for(okResponse)).toBe(okStatus);
        expect(ResponseStatus.for(999)).toBeNull();
    });

    test('it should be comparable', () => {
        const okStatus = ResponseStatus.for(200, 'OK');
        const okTooStatus = new ResponseStatus(200, 'OK Too');
        const createdStatus = ResponseStatus.for(201, 'Created');

        expect(okStatus.compareTo(createdStatus)).toBe(-1);
        expect(createdStatus.compareTo(okStatus)).toBe(1);
        expect(okStatus.compareTo(okStatus)).toBe(0);
        expect(okStatus.compareTo(okTooStatus)).toBe(-1);

        expect(okStatus.equals(okStatus)).toBe(true);
        expect(okStatus.equals(createdStatus)).toBe(false);
    });

    test('sorts by code first, then case-sensitive reason phrase, preserving complete ties', () => {
        const firstOk = new ResponseStatus(200, 'OK');
        const secondOk = new ResponseStatus(200, 'OK');
        const lowerCase = new ResponseStatus(200, 'ok');
        const created = new ResponseStatus(201, 'A');
        const accepted = new ResponseStatus(202, 'A');
        const statuses = [accepted, lowerCase, firstOk, created, secondOk];
        expect(statuses.sort(comparableComparison)).toEqual([firstOk, secondOk, lowerCase, created, accepted]);
        expect(statuses[0]).toBe(firstOk);
        expect(statuses[1]).toBe(secondOk);
    });

    test('it should create responses', () => {
        const okStatus = ResponseStatus.for(200, 'OK');
        const okResponse = okStatus.createResponse(null as unknown as BodyInit);

        expect(okResponse).toHaveProperty('body', null);
        expect(okResponse).toHaveProperty('status', 200);
        expect(okResponse).toHaveProperty('statusText', 'OK');
    });

    test('it should create response inits', () => {
        const okStatus = ResponseStatus.for(200, 'OK');

        expect(okStatus.toResponseInit()).toEqual({ status: 200, statusText: 'OK' });
    });
});
