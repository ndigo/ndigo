/**
 * Vite handles CSS imports at build time; TypeScript needs the ambient
 * declaration to typecheck the client entry (the Web Awesome theme
 * stylesheet is imported for its side effect).
 */
declare module '*.css';
