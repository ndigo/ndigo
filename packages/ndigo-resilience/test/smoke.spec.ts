/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_RETRY_ATTEMPTS } from '@ndigo/resilience';

describe('@ndigo/resilience module surface', () => {
    it('documents the retry attempt default contract', () => {
        expect(DEFAULT_RETRY_ATTEMPTS).toBe(3);
    });
});
