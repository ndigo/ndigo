import { describe, test, expect } from 'vitest';
import { PathRoute } from '../src/path-route';
import {
    DefaultRouteTransactionManager,
    DefaultRouteTransactionStatus,
    RouteTransactionStatus,
} from '../src/transaction-manager';

describe('DefaultRouteTransactionManager', () => {
    test('it should create transaction status with defaults', () => {
        const manager = new DefaultRouteTransactionManager();
        const route = new PathRoute('/users/42');
        const status = manager.getTransaction(route, '/');

        expect(status.route).toBe(route);
        expect(status.previousRoute).toBe('/');
        expect(status.isCompleted).toBe(false);
        expect(status.isRollbackOnly).toBe(false);
        expect(status.isNewTransaction).toBe(true);
    });

    test('it should commit a transaction', () => {
        const manager = new DefaultRouteTransactionManager();
        const status = manager.getTransaction(new PathRoute('/foo'), '/');

        manager.commit(status);

        expect(status.isCompleted).toBe(true);
    });

    test('it should rollback a transaction', () => {
        const manager = new DefaultRouteTransactionManager();
        const originalHash = location.hash;
        const status = manager.getTransaction(new PathRoute('/foo'), '/bar');

        manager.rollback(status);

        expect(status.isCompleted).toBe(true);
        expect(location.hash).toBe('#/bar');

        location.hash = originalHash;
    });

    test('it should skip hash rollback for non-sync transactions', () => {
        const manager = new DefaultRouteTransactionManager();
        const originalHash = location.hash;
        const status = manager.getTransaction(new PathRoute('/foo'), '/bar', false);

        manager.rollback(status);

        expect(status.isCompleted).toBe(true);
        expect(location.hash).toBe(originalHash);
    });

    test('it should rollback when marked rollback-only and commit is called', () => {
        const manager = new DefaultRouteTransactionManager();
        const originalHash = location.hash;
        const status = manager.getTransaction(new PathRoute('/foo'), '/baz') as RouteTransactionStatus;

        status.setRollbackOnly();
        manager.commit(status);

        expect(status.isCompleted).toBe(true);
        expect(location.hash).toBe('#/baz');

        location.hash = originalHash;
    });

    test('it should allow explicit status construction', () => {
        const status = new DefaultRouteTransactionStatus(new PathRoute('/foo'), '/', true);
        status.setRollbackOnly();

        expect(status.isRollbackOnly).toBe(true);
    });
});

describe('Transaction lifecycle integration', () => {
    test('full lifecycle: create → commit → completed', () => {
        const manager = new DefaultRouteTransactionManager();
        const status = manager.getTransaction(new PathRoute('/commit-test'), '/', true);

        expect(status.isCompleted).toBe(false);
        expect(status.isNewTransaction).toBe(true);

        manager.commit(status);
        expect(status.isCompleted).toBe(true);
    });

    test('full lifecycle: create → rollback → hash restored', () => {
        const originalHash = location.hash;
        const manager = new DefaultRouteTransactionManager();
        const status = manager.getTransaction(new PathRoute('/rollback-test'), '/previous', true);

        manager.rollback(status);

        expect(status.isCompleted).toBe(true);
        expect(location.hash).toBe('#/previous');

        location.hash = originalHash;
    });

    test('full lifecycle: create → setRollbackOnly → commit → rollback', () => {
        const originalHash = location.hash;
        const manager = new DefaultRouteTransactionManager();
        const status = manager.getTransaction(new PathRoute('/rollback-target'), '/original-path', true) as RouteTransactionStatus;

        status.setRollbackOnly();
        manager.commit(status);

        expect(status.isCompleted).toBe(true);
        expect(location.hash).toBe('#/original-path');

        location.hash = originalHash;
    });
});
