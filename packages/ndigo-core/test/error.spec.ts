/**
 */
import { describe, test, expect } from 'vitest';
import { ApplicationError, FrameworkError, IllegalStateError } from '../src/error';

describe('ApplicationError', () => {
    test('it should be an instance of Error', () => {
        const error = new ApplicationError('msg');

        expect(error instanceof Error).toBe(true);
    });

    test('it should have name set to ApplicationError', () => {
        const error = new ApplicationError('msg');

        expect(error.name).toBe('ApplicationError');
    });

    test('it should set the message', () => {
        const error = new ApplicationError('msg');

        expect(error.message).toBe('msg');
    });

    test('it should have a stack trace', () => {
        const error = new ApplicationError('msg');

        expect(error.stack).toBeDefined();
    });

    test('it should have correct Symbol.toStringTag', () => {
        const error = new ApplicationError('msg');

        expect(Object.prototype.toString.call(error)).toContain('ApplicationError');
    });

    test('it should serialize to JSON via toJSON', () => {
        const error = new ApplicationError('msg');
        const json = error.toJSON?.();

        expect(json).toMatchObject({
            name: 'ApplicationError',
            message: 'msg',
        });
        expect(json).toHaveProperty('stack');
    });

    test('it should serialize to string via toString', () => {
        const error = new ApplicationError('msg');

        expect(error.toString()).toBe('msg');
    });
});

describe('FrameworkError', () => {
    test('it should be an instance of Error', () => {
        const error = new FrameworkError('msg');

        expect(error instanceof Error).toBe(true);
    });

    test('it should not be an instance of ApplicationError', () => {
        const error = new FrameworkError('msg');

        expect(error instanceof ApplicationError).toBe(false);
    });

    test('it should have name set to FrameworkError', () => {
        const error = new FrameworkError('msg');

        expect(error.name).toBe('FrameworkError');
    });

    test('it should set the message', () => {
        const error = new FrameworkError('msg');

        expect(error.message).toBe('msg');
    });

    test('it should have a stack trace', () => {
        const error = new FrameworkError('msg');

        expect(error.stack).toBeDefined();
    });

    test('it should have correct Symbol.toStringTag', () => {
        const error = new FrameworkError('msg');

        expect(Object.prototype.toString.call(error)).toContain('FrameworkError');
    });

    test('it should serialize to JSON via toJSON', () => {
        const error = new FrameworkError('msg');
        const json = error.toJSON?.();

        expect(json).toMatchObject({
            name: 'FrameworkError',
            message: 'msg',
        });
        expect(json).toHaveProperty('stack');
    });

    test('it should serialize to string via toString', () => {
        const error = new FrameworkError('msg');

        expect(error.toString()).toBe('msg');
    });
});

describe('IllegalStateError', () => {
    test('it should be an instance of FrameworkError', () => {
        const error = new IllegalStateError();

        expect(error instanceof FrameworkError).toBe(true);
    });

    test('it should be an instance of Error', () => {
        const error = new IllegalStateError();

        expect(error instanceof Error).toBe(true);
    });

    test('it should have default message', () => {
        const error = new IllegalStateError();

        expect(error.message).toBe('Unable to complete operation due to misconfiguration');
    });

    test('it should accept a custom message', () => {
        const error = new IllegalStateError('custom');

        expect(error.message).toBe('custom');
    });

    test('it should serialize to JSON', () => {
        const error = new IllegalStateError('custom');
        const json = error.toJSON?.();

        expect(json).toMatchObject({
            name: 'IllegalStateError',
            message: 'custom',
        });
        expect(json).toHaveProperty('stack');
    });
});
