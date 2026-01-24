import { describe, test, expect } from 'vitest';
import ResponseStatus from '../src/response-status';

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

    test('it should create responses', () => {
        const okStatus = ResponseStatus.for(200, 'OK');
        const okResponse = okStatus.createResponse(null);

        expect(okResponse).toHaveProperty('body', null);
        expect(okResponse).toHaveProperty('status', 200);
        expect(okResponse).toHaveProperty('statusText', 'OK');
    });

    test('it should create response inits', () => {
        const okStatus = ResponseStatus.for(200, 'OK');

        expect(okStatus.toResponseInit()).toEqual({ status: 200, statusText: 'OK' });
    });
});
