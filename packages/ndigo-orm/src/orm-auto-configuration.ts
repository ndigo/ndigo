/**
 * Auto-configuration for ORM defaults.
 */
import { configuration, entry, AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { InMemoryDataSource } from './data-source';
import { DATA_SOURCE } from './context-tokens';

@configuration
export class OrmAutoConfiguration extends AsApplicationContextAware(Null) {
    get [Symbol.toStringTag](): string {
        return 'OrmAutoConfiguration';
    }

    readonly applicationContext!: ApplicationContext;

    @entry(DATA_SOURCE)
    dataSource(): InMemoryDataSource {
        return new InMemoryDataSource();
    }
}
