/**
 * Vite handles CSS imports at build time; TypeScript needs the ambient
 * declarations for side-effect stylesheet imports and `?inline` CSS strings
 * (the design tokens, base layer, and shadow-root item styles).
 */
declare module '*.css';
declare module '*.css?inline' {
    const css: string;
    export default css;
}
