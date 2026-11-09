/**
 */
// Ambient module declarations for the base64-encoded fixture assets imported
// by `_worker.ts`. Deliberately a script file (no top-level import/export) so
// these are genuine wildcard ambient declarations rather than module
// augmentations; the compiled spec lane resolves `./*.pdf` etc. imports.
declare module '*.pdf' {
    const pdfSrc: string;
    export default pdfSrc;
}
declare module '*.gif' {
    const gifSrc: string;
    export default gifSrc;
}
declare module '*.jpg' {
    const jpgSrc: string;
    export default jpgSrc;
}
declare module '*.png' {
    const pngSrc: string;
    export default pngSrc;
}
