/* eslint-disable no-undef */
import { defineDetector } from '../has';

// Generated file. Do not edit!

export default () => {
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'buffer', () => typeof Buffer === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'buffer_from', ( has ) => has.buffer && typeof Buffer.from === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'clearimmediate', () => typeof clearImmediate === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'clearinterval', () => typeof clearInterval === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'cleartimeout', () => typeof clearTimeout === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'global', () => typeof global === 'object' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'module', () => typeof module === 'object' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'module_exports', ( has ) => has.module && typeof module.exports === 'object' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'process', () => typeof process === 'object' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'process_nexttick', ( has ) => has.process && typeof process.nextTick === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'setimmediate', () => typeof setImmediate === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'setinterval', () => typeof setInterval === 'function' );
	// @ts-ignore Detecting a feature that may not be supported by TypeScript
	defineDetector( 'settimeout', () => typeof setTimeout === 'function' );
};
