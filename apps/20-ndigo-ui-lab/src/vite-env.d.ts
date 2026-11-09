/**
 * Minimal Vite `import.meta.glob` typing for the lab bootstrap.
 *
 * The full `vite/client` reference is deliberately not used here: the root
 * spec program includes every app source file, and Vite's global
 * `*.pdf`/`*.png` declarations collide with the http fixture ambient modules.
 */
interface ImportMeta {
    glob: (pattern: string | readonly string[], options?: { readonly eager?: boolean }) => Record<string, unknown>;
}

declare module '*.css';
