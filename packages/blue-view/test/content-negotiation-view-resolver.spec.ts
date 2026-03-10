import { describe, expect, test, vi } from 'vitest';
import { ContentNegotiationViewResolver } from '../src/content-negotiation-view-resolver';

describe('ContentNegotiationViewResolver', () => {
    test('it should delegate media type resolution to the content negotiation manager', () => {
        const request = { path: '/index' };
        const mediaTypes = [{ type: 'text', subtype: 'html' }] as any;
        const manager = {
            resolveMediaTypes: vi.fn().mockReturnValue(mediaTypes),
        } as any;

        const resolver = new ContentNegotiationViewResolver(manager);

        expect(resolver.getMediaTypes(request)).toBe(mediaTypes);
        expect(manager.resolveMediaTypes).toHaveBeenCalledWith(request);
    });
});
