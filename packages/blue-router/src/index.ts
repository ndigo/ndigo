/**
 * @author Jeff Rose
 * @see core
 * @see util
 */

export * from './route';
export * from './context-tokens';
export * from './router';
export { default as RouterExecutionChain } from './router-execution-chain';
export * from './feature-routing-registry';
export * from './route-partition';
export * from './site-router';
export * from './path-route';
export * from './router-interceptor';
export * from './transaction-manager';
export * from './route-definition';
export * from './route-registry';
// Re-export from @blue/http for backward compatibility
import { QueryString, MatrixString } from '@blue/http';

export const fromQueryString = QueryString.parse.bind(QueryString);
export const toQueryString = QueryString.stringify.bind(QueryString);
export const fromMatrixString = MatrixString.parse.bind(MatrixString);
export const toMatrixString = MatrixString.stringify.bind(MatrixString);

// Also export the classes directly
export { QueryString, MatrixString };