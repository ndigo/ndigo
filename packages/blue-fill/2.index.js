"use strict";
(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[2],{

/***/ 6:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_has__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fill__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/**
 * @author Jeff Rose
 */


let module;
if ((_blue_has__WEBPACK_IMPORTED_MODULE_0___default().uint8array)) {
    const defineProperty = (_blue_has__WEBPACK_IMPORTED_MODULE_0___default().reflect_defineproperty) ?
        Reflect.defineProperty :
        Object.defineProperty, utf8Encoding = /^(unicode-1-1-)?utf-?8$/, isUtf8 = (value) => utf8Encoding.test(value);
    (0,_fill__WEBPACK_IMPORTED_MODULE_1__["default"])('textdecoder', function () {
        const createBytesArray = (input) => {
            if (input instanceof ArrayBuffer) {
                return new Uint8Array(input);
            }
            else if ('buffer' in input && input.buffer instanceof ArrayBuffer) {
                return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
            }
            else {
                return new Uint8Array(0);
            }
        }, fromCharCode = String.fromCharCode, hasBuffer = (_blue_has__WEBPACK_IMPORTED_MODULE_0___default().buffer_from), windows1252Encoding = /^(ansi_x3.4-1968|(us-)?ascii|(x-)?cp(1252|819)|ibm819|iso[-_]?((8859-?1(:1987)?)|ir-100)|(csiso)?l(atin)?1|windows-1252)$/, isWindows1252 = (value) => windows1252Encoding.test(value), isSupportedEncoding = (value) => isUtf8(value) || isWindows1252(value);
        class TextDecoder {
            constructor(encoding = 'utf-8', options = { fatal: false }) {
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
                    writable: false
                });
                defineProperty(this, 'fatal', {
                    value: options.fatal,
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
                defineProperty(this, 'ignoreBOM', {
                    value: false,
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
            }
            decode(input, options = { stream: false }) {
                if (options.stream) {
                    throw new Error('"stream" option is not supported');
                }
                const bytes = createBytesArray(input);
                if (hasBuffer) {
                    return Buffer.from(bytes).toString(this.encoding);
                }
                else {
                    if (isUtf8(this.encoding)) {
                        const length = bytes.length, out = [];
                        let index = 0;
                        while (index < length) {
                            const byte1 = bytes[index++];
                            if (byte1 === 0) {
                                break; // NULL
                            }
                            // 1-byte
                            if ((byte1 & 0x80) === 0) {
                                out.push(byte1);
                                // 2-byte
                            }
                            else if ((byte1 & 0xe0) === 0xc0) {
                                const byte2 = bytes[index++] & 0x3f;
                                out.push(((byte1 & 0x1f) << 6) | byte2);
                                // 3-byte
                            }
                            else if ((byte1 & 0xf0) === 0xe0) {
                                const byte2 = bytes[index++] & 0x3f;
                                const byte3 = bytes[index++] & 0x3f;
                                out.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
                                // 4-byte
                            }
                            else if ((byte1 & 0xf8) === 0xf0) {
                                const byte2 = bytes[index++] & 0x3f;
                                const byte3 = bytes[index++] & 0x3f;
                                const byte4 = bytes[index++] & 0x3f;
                                // this can be > 0xffff, so possibly generate surrogates
                                let codepoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
                                if (codepoint > 0xffff) {
                                    // codepoint &= ~0x10000;
                                    codepoint -= 0x10000;
                                    out.push((codepoint >>> 10) & 0x3ff | 0xd800);
                                    codepoint = 0xdc00 | codepoint & 0x3ff;
                                }
                                out.push(codepoint);
                            }
                            else {
                                // We're ignoring this
                            }
                        }
                        return fromCharCode.apply(null, out);
                    }
                    else if (isWindows1252(this.encoding)) {
                        return fromCharCode.apply(null, bytes);
                    }
                    else {
                        return '';
                    }
                }
            }
        }
        defineProperty(globalThis, 'TextDecoder', {
            value: TextDecoder,
            configurable: true,
            enumerable: true,
            writable: false
        });
    });
    (0,_fill__WEBPACK_IMPORTED_MODULE_1__["default"])('textencoder', function () {
        class TextEncoder {
            constructor(encoding = 'utf-8') {
                if (!isUtf8(encoding)) {
                    throw new RangeError(`Encoding "${encoding}" is not supported.`);
                }
                defineProperty(this, 'encoding', {
                    value: encoding,
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
            }
            encode(text, options = { stream: false }) {
                if (options.stream) {
                    throw new Error('"stream" option is not supported');
                }
                const length = text.length;
                let at = 0, // output position
                index = 0, tlen = Math.max(32, length + (length >> 1) + 7), // 1.5x size
                target = new Uint8Array((tlen >> 3) << 3); // ... but at 8 byte offset
                while (index < length) {
                    let value = text.charCodeAt(index++);
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
                        tlen *= (1.0 + (index / text.length) * 2); // take 2x the remaining
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
                    }
                    else if ((value & 0xfffff800) === 0) {
                        target[at++] = ((value >> 6) & 0x1f) | 0xc0;
                        // 3-byte
                    }
                    else if ((value & 0xffff0000) === 0) {
                        target[at++] = ((value >> 12) & 0x0f) | 0xe0;
                        target[at++] = ((value >> 6) & 0x3f) | 0x80;
                        // 4-byte
                    }
                    else if ((value & 0xffe00000) === 0) {
                        target[at++] = ((value >> 18) & 0x07) | 0xf0;
                        target[at++] = ((value >> 12) & 0x3f) | 0x80;
                        target[at++] = ((value >> 6) & 0x3f) | 0x80;
                    }
                    else {
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
            writable: false
        });
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (module || Promise.resolve());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW5jb2RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUM7QUFDNUIsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLElBQUksTUFBb0IsQ0FBQztBQUV6QixJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUU7SUFDaEIsTUFDSSxjQUFjLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDekMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxjQUFjLEVBRXpCLFlBQVksR0FBRyx5QkFBeUIsRUFDeEMsTUFBTSxHQUFHLENBQUUsS0FBYSxFQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxDQUFDO0lBRXRFLElBQUksQ0FBRSxhQUFhLEVBQUU7UUFDakIsTUFDSSxnQkFBZ0IsR0FBRyxDQUFFLEtBQW9DLEVBQWUsRUFBRTtZQUN0RSxJQUFJLEtBQUssWUFBWSxXQUFXLEVBQUU7Z0JBQzlCLE9BQU8sSUFBSSxVQUFVLENBQUUsS0FBSyxDQUFFLENBQUM7YUFDbEM7aUJBQU0sSUFBSSxRQUFRLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLFlBQVksV0FBVyxFQUFFO2dCQUNqRSxPQUFPLElBQUksVUFBVSxDQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFFLENBQUM7YUFDN0U7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLFVBQVUsQ0FBRSxDQUFDLENBQUUsQ0FBQzthQUM5QjtRQUNMLENBQUMsRUFFRCxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFFbEMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBRTNCLG1CQUFtQixHQUFHLDJIQUEySCxFQUNqSixhQUFhLEdBQUcsQ0FBRSxLQUFhLEVBQVksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsRUFFL0UsbUJBQW1CLEdBQUcsQ0FBRSxLQUFhLEVBQVksRUFBRSxDQUFDLE1BQU0sQ0FBRSxLQUFLLENBQUUsSUFBSSxhQUFhLENBQUUsS0FBSyxDQUFFLENBQUM7UUFFbEcsTUFBTSxXQUFXO1lBS2IsWUFBYSxXQUFtQixPQUFPLEVBQUUsT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtnQkFDL0QsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLG1CQUFtQixDQUFFLFFBQVEsQ0FBRSxFQUFFO29CQUNoRCxNQUFNLElBQUksVUFBVSxDQUFFLGFBQWMsUUFBUyxxQkFBcUIsQ0FBRSxDQUFDO2lCQUN4RTtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7b0JBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBRSxrQ0FBa0MsQ0FBRSxDQUFDO2lCQUN6RDtnQkFFRCxjQUFjLENBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtvQkFDOUIsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsWUFBWSxFQUFFLElBQUk7b0JBQ2xCLFVBQVUsRUFBRSxLQUFLO29CQUNqQixRQUFRLEVBQUUsS0FBSztpQkFDbEIsQ0FBRSxDQUFDO2dCQUVKLGNBQWMsQ0FBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO29CQUMzQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7b0JBQ3BCLFlBQVksRUFBRSxJQUFJO29CQUNsQixVQUFVLEVBQUUsS0FBSztvQkFDakIsUUFBUSxFQUFFLEtBQUs7aUJBQ2xCLENBQUUsQ0FBQztnQkFFSixjQUFjLENBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtvQkFDL0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osWUFBWSxFQUFFLElBQUk7b0JBQ2xCLFVBQVUsRUFBRSxLQUFLO29CQUNqQixRQUFRLEVBQUUsS0FBSztpQkFDbEIsQ0FBRSxDQUFDO1lBQ1IsQ0FBQztZQUVELE1BQU0sQ0FBRSxLQUFvQyxFQUFFLE9BQU8sR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7Z0JBQ3JFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBRSxrQ0FBa0MsQ0FBRSxDQUFDO2lCQUN6RDtnQkFFRCxNQUFNLEtBQUssR0FBZSxnQkFBZ0IsQ0FBRSxLQUFLLENBQUUsQ0FBQztnQkFFcEQsSUFBSSxTQUFTLEVBQUU7b0JBQ1gsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUM7aUJBQ3pEO3FCQUFNO29CQUNILElBQUksTUFBTSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUUsRUFBRTt3QkFDekIsTUFDSSxNQUFNLEdBQVcsS0FBSyxDQUFDLE1BQU0sRUFDN0IsR0FBRyxHQUFhLEVBQUUsQ0FBQzt3QkFDdkIsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO3dCQUV0QixPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUU7NEJBQ25CLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBRSxLQUFLLEVBQUUsQ0FBRSxDQUFDOzRCQUN2QyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0NBQ2IsTUFBTSxDQUFFLE9BQU87NkJBQ2xCOzRCQUVELFNBQVM7NEJBQ1QsSUFBSSxDQUFFLEtBQUssR0FBRyxJQUFJLENBQUUsS0FBSyxDQUFDLEVBQUU7Z0NBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7Z0NBRXRCLFNBQVM7NkJBQ1I7aUNBQU0sSUFBSSxDQUFFLEtBQUssR0FBRyxJQUFJLENBQUUsS0FBSyxJQUFJLEVBQUU7Z0NBQ2xDLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBRSxLQUFLLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQztnQ0FDOUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFFLENBQUUsS0FBSyxHQUFHLElBQUksQ0FBRSxJQUFJLENBQUMsQ0FBRSxHQUFHLEtBQUssQ0FBRSxDQUFDO2dDQUVsRCxTQUFTOzZCQUNSO2lDQUFNLElBQUksQ0FBRSxLQUFLLEdBQUcsSUFBSSxDQUFFLEtBQUssSUFBSSxFQUFFO2dDQUNsQyxNQUFNLEtBQUssR0FBVyxLQUFLLENBQUUsS0FBSyxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUM7Z0NBQzlDLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBRSxLQUFLLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQztnQ0FDOUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFFLENBQUUsS0FBSyxHQUFHLElBQUksQ0FBRSxJQUFJLEVBQUUsQ0FBRSxHQUFHLENBQUUsS0FBSyxJQUFJLENBQUMsQ0FBRSxHQUFHLEtBQUssQ0FBRSxDQUFDO2dDQUVwRSxTQUFTOzZCQUNSO2lDQUFNLElBQUksQ0FBRSxLQUFLLEdBQUcsSUFBSSxDQUFFLEtBQUssSUFBSSxFQUFFO2dDQUNsQyxNQUFNLEtBQUssR0FBVyxLQUFLLENBQUUsS0FBSyxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUM7Z0NBQzlDLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBRSxLQUFLLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQztnQ0FDOUMsTUFBTSxLQUFLLEdBQVcsS0FBSyxDQUFFLEtBQUssRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDO2dDQUU5Qyx3REFBd0Q7Z0NBQ3hELElBQUksU0FBUyxHQUFXLENBQUUsQ0FBRSxLQUFLLEdBQUcsSUFBSSxDQUFFLElBQUksSUFBSSxDQUFFLEdBQUcsQ0FBRSxLQUFLLElBQUksSUFBSSxDQUFFLEdBQUcsQ0FBRSxLQUFLLElBQUksSUFBSSxDQUFFLEdBQUcsS0FBSyxDQUFDO2dDQUNyRyxJQUFJLFNBQVMsR0FBRyxNQUFNLEVBQUU7b0NBQ3BCLHlCQUF5QjtvQ0FDekIsU0FBUyxJQUFJLE9BQU8sQ0FBQztvQ0FDckIsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFFLFNBQVMsS0FBSyxFQUFFLENBQUUsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFFLENBQUM7b0NBQ2xELFNBQVMsR0FBRyxNQUFNLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQztpQ0FDMUM7Z0NBQ0QsR0FBRyxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQzs2QkFDekI7aUNBQU07Z0NBQ0gsc0JBQXNCOzZCQUN6Qjt5QkFDSjt3QkFFRCxPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBRSxDQUFDO3FCQUMxQzt5QkFBTSxJQUFJLGFBQWEsQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFFLEVBQUU7d0JBQ3ZDLE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBRSxJQUFJLEVBQUUsS0FBSyxDQUFFLENBQUM7cUJBQzVDO3lCQUFNO3dCQUNILE9BQU8sRUFBRSxDQUFDO3FCQUNiO2lCQUNKO1lBQ0wsQ0FBQztTQUNKO1FBRUQsY0FBYyxDQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUU7WUFDdkMsS0FBSyxFQUFFLFdBQVc7WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO0lBQ1IsQ0FBQyxDQUFFLENBQUM7SUFFSixJQUFJLENBQUUsYUFBYSxFQUFFO1FBQ2pCLE1BQU0sV0FBVztZQUdiLFlBQWEsV0FBbUIsT0FBTztnQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxRQUFRLENBQUUsRUFBRTtvQkFDckIsTUFBTSxJQUFJLFVBQVUsQ0FBRSxhQUFjLFFBQVMscUJBQXFCLENBQUUsQ0FBQztpQkFDeEU7Z0JBRUQsY0FBYyxDQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7b0JBQzlCLEtBQUssRUFBRSxRQUFRO29CQUNmLFlBQVksRUFBRSxJQUFJO29CQUNsQixVQUFVLEVBQUUsS0FBSztvQkFDakIsUUFBUSxFQUFFLEtBQUs7aUJBQ2xCLENBQUUsQ0FBQztZQUNSLENBQUM7WUFFRCxNQUFNLENBQUUsSUFBWSxFQUFFLE9BQU8sR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7Z0JBQzdDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBRSxrQ0FBa0MsQ0FBRSxDQUFDO2lCQUN6RDtnQkFFRCxNQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUVuQyxJQUFJLEVBQUUsR0FBVyxDQUFDLEVBQUcsa0JBQWtCO2dCQUNuQyxLQUFLLEdBQVcsQ0FBQyxFQUNqQixJQUFJLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBRSxFQUFFLEVBQUUsTUFBTSxHQUFHLENBQUUsTUFBTSxJQUFJLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFHLFlBQVk7Z0JBQzFFLE1BQU0sR0FBZSxJQUFJLFVBQVUsQ0FBRSxDQUFFLElBQUksSUFBSSxDQUFDLENBQUUsSUFBSSxDQUFDLENBQUUsQ0FBQyxDQUFFLDJCQUEyQjtnQkFFM0YsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFO29CQUNuQixJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsVUFBVSxDQUFFLEtBQUssRUFBRSxDQUFFLENBQUM7b0JBRS9DLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFO3dCQUNwQyxpQkFBaUI7d0JBQ2pCLElBQUksS0FBSyxHQUFHLE1BQU0sRUFBRTs0QkFDaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBRSxLQUFLLENBQUUsQ0FBQzs0QkFDdkMsSUFBSSxDQUFFLEtBQUssR0FBRyxNQUFNLENBQUUsS0FBSyxNQUFNLEVBQUU7Z0NBQy9CLEVBQUUsS0FBSyxDQUFDO2dDQUNSLEtBQUssR0FBRyxDQUFFLENBQUUsS0FBSyxHQUFHLEtBQUssQ0FBRSxJQUFJLEVBQUUsQ0FBRSxHQUFHLENBQUUsS0FBSyxHQUFHLEtBQUssQ0FBRSxHQUFHLE9BQU8sQ0FBQzs2QkFDckU7eUJBQ0o7d0JBQ0QsSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7NEJBQ3BDLFNBQVMsQ0FBRSxzQkFBc0I7eUJBQ3BDO3FCQUNKO29CQUVELGlEQUFpRDtvQkFDakQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUU7d0JBQ3hCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBRSxnQkFBZ0I7d0JBQzVCLElBQUksSUFBSSxDQUFFLEdBQUcsR0FBRyxDQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSx3QkFBd0I7d0JBQ3hFLElBQUksR0FBRyxDQUFFLElBQUksSUFBSSxDQUFDLENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBRSxnQkFBZ0I7d0JBRTVDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFFLElBQUksQ0FBRSxDQUFDO3dCQUN0QyxNQUFNLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBRSxDQUFDO3dCQUNyQixNQUFNLEdBQUcsTUFBTSxDQUFDO3FCQUNuQjtvQkFFRCxTQUFTO29CQUNULElBQUksQ0FBRSxLQUFLLEdBQUcsVUFBVSxDQUFFLEtBQUssQ0FBQyxFQUFFO3dCQUM5QixNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxRQUFRO3dCQUNoQyxTQUFTO3dCQUViLFNBQVM7cUJBQ1I7eUJBQU0sSUFBSSxDQUFFLEtBQUssR0FBRyxVQUFVLENBQUUsS0FBSyxDQUFDLEVBQUU7d0JBQ3JDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUUsQ0FBRSxLQUFLLElBQUssQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFFLEdBQUcsSUFBSSxDQUFDO3dCQUV2RCxTQUFTO3FCQUNSO3lCQUFNLElBQUksQ0FBRSxLQUFLLEdBQUcsVUFBVSxDQUFFLEtBQUssQ0FBQyxFQUFFO3dCQUNyQyxNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsR0FBRyxDQUFFLENBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBRSxHQUFHLElBQUksQ0FBQzt3QkFDbkQsTUFBTSxDQUFFLEVBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBRSxDQUFFLEtBQUssSUFBSyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUUsR0FBRyxJQUFJLENBQUM7d0JBRXZELFNBQVM7cUJBQ1I7eUJBQU0sSUFBSSxDQUFFLEtBQUssR0FBRyxVQUFVLENBQUUsS0FBSyxDQUFDLEVBQUU7d0JBQ3JDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUUsQ0FBRSxLQUFLLElBQUksRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFFLEdBQUcsSUFBSSxDQUFDO3dCQUNuRCxNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsR0FBRyxDQUFFLENBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBRSxHQUFHLElBQUksQ0FBQzt3QkFDbkQsTUFBTSxDQUFFLEVBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBRSxDQUFFLEtBQUssSUFBSyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUUsR0FBRyxJQUFJLENBQUM7cUJBQ3REO3lCQUFNO3dCQUNILFNBQVM7cUJBQ1o7b0JBRUQsTUFBTSxDQUFFLEVBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBRSxLQUFLLEdBQUcsSUFBSSxDQUFFLEdBQUcsSUFBSSxDQUFDO2lCQUM1QztnQkFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFDO1lBQ2pDLENBQUM7U0FDSjtRQUVELGNBQWMsQ0FBRSxVQUFVLEVBQUUsYUFBYSxFQUFFO1lBQ3ZDLEtBQUssRUFBRSxXQUFXO1lBQ2xCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUMsQ0FBRSxDQUFDO0NBQ1A7QUFFRCxlQUFlLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMifQ==

/***/ }),

/***/ 5:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_has__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fills__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/**
 * @author Jeff Rose
 */


/**
 * @function module:fill.fill
 * @param {external:string|exteral:Array<external:string>} id
 * @param {external:Function} onMissing
 * @param {external:Function} [onFound=null]
 */
const fill = (id, onMissing, onFound = null) => {
    // * This code block written with convenience, not efficiency or performance, in mind. It would
    // * likely be more efficient to have different code paths based on whether id is a string or
    // * array of strings instead of just converting everything into an array of strings. -JBR
    if (typeof id === 'string') {
        id = [id];
    }
    const hasId = id.reduce((sum, value) => sum && (_blue_has__WEBPACK_IMPORTED_MODULE_0___default())[value], true);
    if (!hasId) {
        onMissing();
        const length = id.length;
        for (let index = 0; index < length; index++) {
            _fills__WEBPACK_IMPORTED_MODULE_1__["default"].push(id[index]);
            (0,_blue_has__WEBPACK_IMPORTED_MODULE_0__.resetDetector)(id[index]);
        }
    }
    else if (onFound) {
        onFound();
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fill);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDL0MsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBRTVCOzs7OztHQUtHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsQ0FBRSxFQUFxQixFQUFFLFNBQW1CLEVBQUUsVUFBb0IsSUFBSSxFQUFHLEVBQUU7SUFDcEYsK0ZBQStGO0lBQy9GLDZGQUE2RjtJQUM3RiwwRkFBMEY7SUFDMUYsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7UUFDeEIsRUFBRSxHQUFHLENBQUUsRUFBRSxDQUFFLENBQUM7S0FDZjtJQUVELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBRSxHQUFHLEVBQUUsS0FBSyxFQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFFLEtBQUssQ0FBRSxFQUFFLElBQUksQ0FBRSxDQUFDO0lBRXZFLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixTQUFTLEVBQUUsQ0FBQztRQUVaLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDekIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFFLEVBQUUsQ0FBRSxLQUFLLENBQUUsQ0FBRSxDQUFDO1lBQzFCLGFBQWEsQ0FBRSxFQUFFLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztTQUNoQztLQUNKO1NBQU0sSUFBSSxPQUFPLEVBQUU7UUFDaEIsT0FBTyxFQUFFLENBQUM7S0FDYjtBQUNMLENBQUMsQ0FBQztBQUVGLGVBQWUsSUFBSSxDQUFDIn0=

/***/ })

}]);