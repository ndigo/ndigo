/**
 * @author Jeff Rose
 * @see core
 * @see util
 */

export * from './route';
export * from './router';
export * from './path-route';
export * from './router-interceptor';
export { default as HashRouter } from './hash-router';
// Re-export from @blue/http for backward compatibility
import { QueryString, MatrixString } from '@blue/http';

export const fromQueryString = QueryString.parse.bind(QueryString);
export const toQueryString = QueryString.stringify.bind(QueryString);
export const fromMatrixString = MatrixString.parse.bind(MatrixString);
export const toMatrixString = MatrixString.stringify.bind(MatrixString);

// Also export the classes directly
export { QueryString, MatrixString };
