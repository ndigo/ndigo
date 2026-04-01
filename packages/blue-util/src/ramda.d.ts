/**
 * Bridge module declaration for ramda types.
 *
 * The official @types/ramda package's es/index.d.ts uses
 * `export * from "../index.js"` which fails under moduleResolution: "Bundler"
 * (there is no index.js, only index.d.ts). This local ambient declaration
 * provides the same bridge, re-exporting all types from the types-ramda
 * package directly.
 *
 * The companion file ramda-extensions.d.ts augments this module with types
 * for functions added in ramda 0.32.0 that are not yet in types-ramda 0.31.0.
 *
 * @see KNOWN_ISSUES.md for full history
 * @author opencode
 */
declare module 'ramda' {
    export * from 'types-ramda';
}
