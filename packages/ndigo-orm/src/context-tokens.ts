/**
 * Context tokens for `@ndigo/orm`.
 */
import { ContextToken } from '@ndigo/factory';
import type { DataSource } from './data-source';

/**
 * Token for the application's shared {@link DataSource} entry. Apps register
 * their chosen implementation (`InMemoryDataSource`, `DrizzleDataSource`, …)
 * under it; consumers resolve it with `context.getValue(DATA_SOURCE)` (or
 * receive it via `DataSourceAware`).
 */
export const DATA_SOURCE = new ContextToken<DataSource>('dataSource');
