/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { NodeMultipartFile } from '../src/multipart-file';

describe('NodeMultipartFile', () => {
    test('bytes() returns a real copy — mutating it never affects later reads (DSG-2)', async () => {
        const source = Buffer.from('file-contents');
        const file = new NodeMultipartFile('file', 'a.txt', 'text/plain', { kind: 'buffer', data: source });

        const first = await file.bytes();
        expect([...first]).toEqual([...source]);
        first[0] = 0x5a; // 'Z' — must not leak into the parser's buffer.

        const second = await file.bytes();
        expect([...second]).toEqual([...Buffer.from('file-contents')]);
        // The parser-owned buffer is untouched too.
        expect(source[0]).toBe(0x66); // 'f'
    });
});
