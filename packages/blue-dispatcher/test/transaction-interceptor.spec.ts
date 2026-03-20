import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PathRoute, RouteTransactionManager, RouteTransactionStatus } from '@blue/router';
import { ModelAndView } from '../src/model-and-view';
import { TransactionRouteHandlerInterceptor } from '../src/transaction-interceptor';

describe('TransactionRouteHandlerInterceptor', () => {
    let interceptor: TransactionRouteHandlerInterceptor;
    let mockTransactionManager: RouteTransactionManager;
    let mockStatus: RouteTransactionStatus;

    beforeEach(() => {
        mockStatus = {
            isCompleted: false,
            isRollbackOnly: false,
            isNewTransaction: true,
            route: new PathRoute('/test'),
            previousRoute: '/old',
            syncHash: true,
            setRollbackOnly: vi.fn(),
        };

        mockTransactionManager = {
            getTransaction: vi.fn().mockReturnValue(mockStatus),
            commit: vi.fn(),
            rollback: vi.fn(),
        };

        interceptor = new TransactionRouteHandlerInterceptor(mockTransactionManager);
    });

    it('should start transaction on preHandle', async () => {
        const route = new PathRoute('/test');
        await interceptor.preHandle(route, {});

        expect(mockTransactionManager.getTransaction).toHaveBeenCalledWith(route, location.hash, true);
    });

    it('should commit transaction on postHandle', async () => {
        const route = new PathRoute('/test');
        await interceptor.preHandle(route, {});
        await interceptor.postHandle(route, {}, new ModelAndView('test'));

        expect(mockTransactionManager.commit).toHaveBeenCalledWith(mockStatus);
    });

    it('should rollback transaction on completeHandle with error', async () => {
        const route = new PathRoute('/test');
        await interceptor.preHandle(route, {});
        await interceptor.completeHandle(route, {}, new Error('Test Error'));

        expect(mockStatus.setRollbackOnly).toHaveBeenCalled();
        expect(mockTransactionManager.rollback).toHaveBeenCalledWith(mockStatus);
    });

    it('should not rollback transaction on completeHandle without error', async () => {
        const route = new PathRoute('/test');
        await interceptor.preHandle(route, {});
        await interceptor.completeHandle(route, {}, null);

        expect(mockStatus.setRollbackOnly).not.toHaveBeenCalled();
        expect(mockTransactionManager.rollback).not.toHaveBeenCalled();
    });
});
