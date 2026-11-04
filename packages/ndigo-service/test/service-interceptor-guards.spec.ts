/**
 * @module ndigo-service
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import {
    likeCompletionAwareServiceInterceptor,
    likeErrorAwareServiceInterceptor,
    likeInitializationAwareServiceInterceptor,
    likeRequestAwareServiceInterceptor,
    likeResponseAwareServiceInterceptor,
    likeServiceInterceptor,
} from '../src/service';

describe('service interceptor guards', () => {
    test('likeCompletionAwareServiceInterceptor should detect postRequest', () => {
        expect(likeCompletionAwareServiceInterceptor({ postRequest: () => void 0 })).toBe(true);
        expect(likeCompletionAwareServiceInterceptor({})).toBe(false);
    });

    test('likeErrorAwareServiceInterceptor should detect postFailure', () => {
        expect(likeErrorAwareServiceInterceptor({ postFailure: () => void 0 })).toBe(true);
        expect(likeErrorAwareServiceInterceptor({})).toBe(false);
    });

    test('likeInitializationAwareServiceInterceptor should detect preInit', () => {
        expect(likeInitializationAwareServiceInterceptor({ preInit: () => true })).toBe(true);
        expect(likeInitializationAwareServiceInterceptor({})).toBe(false);
    });

    test('likeRequestAwareServiceInterceptor should detect preRequest', () => {
        expect(likeRequestAwareServiceInterceptor({ preRequest: async () => undefined })).toBe(true);
        expect(likeRequestAwareServiceInterceptor({})).toBe(false);
    });

    test('likeResponseAwareServiceInterceptor should detect postSuccess', () => {
        expect(likeResponseAwareServiceInterceptor({ postSuccess: async () => undefined })).toBe(true);
        expect(likeResponseAwareServiceInterceptor({})).toBe(false);
    });

    test('likeServiceInterceptor should detect any valid interceptor shape', () => {
        expect(likeServiceInterceptor({ postRequest: () => void 0 })).toBe(true);
        expect(likeServiceInterceptor({ postFailure: () => void 0 })).toBe(true);
        expect(likeServiceInterceptor({ preInit: () => true })).toBe(true);
        expect(likeServiceInterceptor({ preRequest: async () => undefined })).toBe(true);
        expect(likeServiceInterceptor({ postSuccess: async () => undefined })).toBe(true);
        expect(likeServiceInterceptor({ notAnInterceptor: true })).toBe(false);
    });
});
