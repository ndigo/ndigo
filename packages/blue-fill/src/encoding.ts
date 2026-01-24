/**
 * @author Jeff Rose
 */

import has from '@blue/has';
import fill from './fill';

let module: Promise<any>;

if (has.uint8array) {
    const defineProperty = has.reflect_defineproperty ? Reflect.defineProperty : Object.defineProperty,
        utf8Encoding = /^(unicode-1-1-)?utf-?8$/,
        isUtf8 = (value: string): boolean => utf8Encoding.test(value);

    fill('textdecoder', function () {
        const createBytesArray = (input: ArrayBuffer | ArrayBufferView): Uint8Array => {
                if (input instanceof ArrayBuffer) {
                    return new Uint8Array(input);
                } else if ('buffer' in input && input.buffer instanceof ArrayBuffer) {
                    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
                } else {
                    return new Uint8Array(0);
                }
            },
            fromCharCode = String.fromCharCode,
            hasBuffer = has.buffer_from,
            windows1252Encoding =
                /^(ansi_x3.4-1968|(us-)?ascii|(x-)?cp(1252|819)|ibm819|iso[-_]?((8859-?1(:1987)?)|ir-100)|(csiso)?l(atin)?1|windows-1252)$/,
            isWindows1252 = (value: string): boolean => windows1252Encoding.test(value),
            isSupportedEncoding = (value: string): boolean => isUtf8(value) || isWindows1252(value);

        class TextDecoder {
            readonly encoding: BufferEncoding;
            readonly fatal: boolean;
            readonly ignoreBOM: boolean;

            constructor(encoding: string = 'utf-8', options = { fatal: false }) {
                if (!hasBuffer && !isSupportedEncoding(encoding)) {
                    throw new RangeError(`Encoding "${encoding}" is not supported.`);
                }

                if (options.fatal) {
                    throw new Error('"fatal" option is not supported.');
                }

                defineProperty(this, 'encoding', {
                    value: encoding,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });

                defineProperty(this, 'fatal', {
                    value: options.fatal,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });

                defineProperty(this, 'ignoreBOM', {
                    value: false,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }

            decode(input: ArrayBuffer | ArrayBufferView, options = { stream: false }): string {
                if (options.stream) {
                    throw new Error('"stream" option is not supported');
                }

                const bytes: Uint8Array = createBytesArray(input);

                if (hasBuffer) {
                    return Buffer.from(bytes).toString(this.encoding);
                } else {
                    if (isUtf8(this.encoding)) {
                        const length: number = bytes.length,
                            out: number[] = [];
                        let index: number = 0;

                        while (index < length) {
                            const byte1: number = bytes[index++];
                            if (byte1 === 0) {
                                break; // NULL
                            }

                            // 1-byte
                            if ((byte1 & 0x80) === 0) {
                                out.push(byte1);

                                // 2-byte
                            } else if ((byte1 & 0xe0) === 0xc0) {
                                const byte2: number = bytes[index++] & 0x3f;
                                out.push(((byte1 & 0x1f) << 6) | byte2);

                                // 3-byte
                            } else if ((byte1 & 0xf0) === 0xe0) {
                                const byte2: number = bytes[index++] & 0x3f;
                                const byte3: number = bytes[index++] & 0x3f;
                                out.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);

                                // 4-byte
                            } else if ((byte1 & 0xf8) === 0xf0) {
                                const byte2: number = bytes[index++] & 0x3f;
                                const byte3: number = bytes[index++] & 0x3f;
                                const byte4: number = bytes[index++] & 0x3f;

                                // this can be > 0xffff, so possibly generate surrogates
                                let codepoint: number =
                                    ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
                                if (codepoint > 0xffff) {
                                    // codepoint &= ~0x10000;
                                    codepoint -= 0x10000;
                                    out.push(((codepoint >>> 10) & 0x3ff) | 0xd800);
                                    codepoint = 0xdc00 | (codepoint & 0x3ff);
                                }
                                out.push(codepoint);
                            } else {
                                // We're ignoring this
                            }
                        }

                        return fromCharCode.apply(null, out);
                    } else if (isWindows1252(this.encoding)) {
                        return fromCharCode.apply(null, bytes);
                    } else {
                        return '';
                    }
                }
            }
        }

        defineProperty(globalThis, 'TextDecoder', {
            value: TextDecoder,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    });

    fill('textencoder', function () {
        class TextEncoder {
            readonly encoding: string;

            constructor(encoding: string = 'utf-8') {
                if (!isUtf8(encoding)) {
                    throw new RangeError(`Encoding "${encoding}" is not supported.`);
                }

                defineProperty(this, 'encoding', {
                    value: encoding,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }

            encode(text: string, options = { stream: false }): Uint8Array {
                if (options.stream) {
                    throw new Error('"stream" option is not supported');
                }

                const length: number = text.length;

                let at: number = 0, // output position
                    index: number = 0,
                    tlen: number = Math.max(32, length + (length >> 1) + 7), // 1.5x size
                    target: Uint8Array = new Uint8Array((tlen >> 3) << 3); // ... but at 8 byte offset

                while (index < length) {
                    let value: number = text.charCodeAt(index++);

                    if (value >= 0xd800 && value <= 0xdbff) {
                        // high surrogate
                        if (index < length) {
                            const extra = text.charCodeAt(index);
                            if ((extra & 0xfc00) === 0xdc00) {
                                ++index;
                                value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                            }
                        }
                        if (value >= 0xd800 && value <= 0xdbff) {
                            continue; // drop lone surrogate
                        }
                    }

                    // expand the buffer if we couldn't write 4 bytes
                    if (at + 4 > target.length) {
                        tlen += 8; // minimum extra
                        tlen *= 1.0 + (index / text.length) * 2; // take 2x the remaining
                        tlen = (tlen >> 3) << 3; // 8 byte offset

                        const update = new Uint8Array(tlen);
                        update.set(target);
                        target = update;
                    }

                    // 1-byte
                    if ((value & 0xffffff80) === 0) {
                        target[at++] = value; // ASCII
                        continue;

                        // 2-byte
                    } else if ((value & 0xfffff800) === 0) {
                        target[at++] = ((value >> 6) & 0x1f) | 0xc0;

                        // 3-byte
                    } else if ((value & 0xffff0000) === 0) {
                        target[at++] = ((value >> 12) & 0x0f) | 0xe0;
                        target[at++] = ((value >> 6) & 0x3f) | 0x80;

                        // 4-byte
                    } else if ((value & 0xffe00000) === 0) {
                        target[at++] = ((value >> 18) & 0x07) | 0xf0;
                        target[at++] = ((value >> 12) & 0x3f) | 0x80;
                        target[at++] = ((value >> 6) & 0x3f) | 0x80;
                    } else {
                        continue;
                    }

                    target[at++] = (value & 0x3f) | 0x80;
                }

                return target.slice(0, at);
            }
        }

        defineProperty(globalThis, 'TextEncoder', {
            value: TextEncoder,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    });
}

export default module || Promise.resolve();
