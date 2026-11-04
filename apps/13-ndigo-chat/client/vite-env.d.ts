/**
 * Vite handles CSS imports at build time; TypeScript needs the ambient
 * declaration to typecheck the client entry (the chat stylesheet is imported
 * for its side effect).
 *
 * @module ndigo-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
declare module '*.css';
