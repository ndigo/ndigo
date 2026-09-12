/**
 * @blue/view-ejs — EJS view technology for Blue.
 *
 * Server-side EJS template rendering expressed as an isomorphic Blue view
 * technology. {@link EJSView} renders to any {@link ViewTarget}, so the same
 * package serves Node HTTP responses, browser SSR DOM, or a DOM-free capture
 * target in tests. Platform I/O (reading template files) lives behind the
 * `TemplateSourceProvider` contract in `@blue/view`; the Node HTTP response
 * target lives in `@blue/platform-node`. This package owns none of it.
 */

export * from './ejs-template-engine';
export * from './ejs-view';
export * from './ejs-view-resolver';
