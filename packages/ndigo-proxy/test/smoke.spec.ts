/**
 * @since 1.0.0
 * @author Jeff Rose
 */

import { describe, expect, it } from 'vitest';
import { PROXY_METADATA_PREFIX } from '@ndigo/proxy';

describe('@ndigo/proxy module surface', () => {
    it('reserves the proxy metadata namespace', () => {
        expect(PROXY_METADATA_PREFIX).toBe('proxy:');
    });
});
