(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["blue-view-webcomponent"] = factory();
	else
		root["blue-view-webcomponent"] = factory();
})(globalThis, function() {
return /******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
//import { ViewElement } from './view';
//customElements.define( 'view', ViewElement );

/******/ 	return __webpack_exports__;
/******/ })()
;
});