/** @author Jeff Rose */

import { IllegalStateError } from '@blue/core';
import { InMemoryDataSource } from '../src/data-source';

describe('InMemoryDataSource', () => {
    let dataSource: InMemoryDataSource;

    beforeEach(() => {
        dataSource = new InMemoryDataSource();
    });

    describe('lifecycle', () => {
        it('initializes with destroyed = false', () => {
            expect(dataSource.destroyed).toBe(false);
        });

        it('init is callable without throwing', () => {
            expect(() => dataSource.init()).not.toThrow();
        });

        it('destroy clears stores and sets destroyed = true', () => {
            dataSource.createStore('users');
            dataSource.getStore('users').set(1, { id: 1 });

            dataSource.destroy();

            expect(dataSource.destroyed).toBe(true);
            expect(dataSource.hasStore('users')).toBe(false);
        });
    });

    describe('stores', () => {
        it('createStore creates a new store', () => {
            dataSource.createStore('users');

            expect(dataSource.hasStore('users')).toBe(true);
            expect(dataSource.getStore('users') instanceof Map).toBe(true);
        });

        it('hasStore returns true/false correctly', () => {
            expect(dataSource.hasStore('missing')).toBe(false);

            dataSource.createStore('users');

            expect(dataSource.hasStore('users')).toBe(true);
        });

        it('getStore returns the Map for existing store', () => {
            dataSource.createStore('users');
            const store = dataSource.getStore('users');
            store.set('a', 1);

            expect(store.get('a')).toBe(1);
        });

        it('getStore throws IllegalStateError for non-existent store', () => {
            expect(() => dataSource.getStore('missing')).toThrow(IllegalStateError);
        });

        it('clear removes all stores', () => {
            dataSource.createStore('users');
            dataSource.createStore('products');

            dataSource.clear();

            expect(dataSource.hasStore('users')).toBe(false);
            expect(dataSource.hasStore('products')).toBe(false);
        });

        it('creating a store twice does not overwrite existing data', () => {
            dataSource.createStore('users');
            const store = dataSource.getStore('users');
            store.set(1, { id: 1 });

            dataSource.createStore('users');

            expect(dataSource.getStore('users').get(1)).toEqual({ id: 1 });
        });
    });
});
