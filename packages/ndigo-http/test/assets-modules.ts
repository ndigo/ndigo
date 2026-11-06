/**
 */
// Ambient module declarations for the base64-encoded fixture assets imported
// by `_worker.ts`. Deliberately a script file (no top-level import/export) so
// these are genuine wildcard ambient declarations rather than module
// augmentations; the compiled spec lane resolves `./*.pdf` etc. imports.
declare module '*.pdf' {
    const src: string;
    export default src;
}
declare module '*.gif' {
    const src: string;
    export default src;
}
declare module '*.jpg' {
    const src: string;
    export default src;
}
declare module '*.png' {
    const src: string;
    export default src;
}
