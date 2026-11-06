/**
 * Method-interception demo gate (AD-42 D-8): boots the REAL ndigo-api
 * bootstrap path (same assembly as `src/index.ts`) and proves a
 * container-managed `@audited` interceptor advises a constructor-created
 * entry while leaving plain methods and private state untouched.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { interception } from '@ndigo/proxy';
import type { ConfigurableApplicationContext } from '@ndigo/context';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { AuditInterceptor } from '../src/audit-interceptor';
import { OrderService } from '../src/order-service';
import { initAuth } from '../src/auth-store';

describe('ndigo-api method interception demo gate (AD-42 D-8)', () => {
    let context: ConfigurableApplicationContext;
    let audit: AuditInterceptor;
    let orders: OrderService;

    beforeAll(async () => {
        initAuth();
        // The same registration `src/index.ts` performs: the processor is
        // registered on the builder, so the context applies it before
        // refresh — `orderService` (a constructor entry, eagerly created at
        // refresh end) is woven at creation.
        audit = new AuditInterceptor();
        const builder = new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            NodeAppConfiguration,
            ServerConfig,
        ])
            .profiles('dev')
            .processors(interception([audit]));
        context = await builder.run();
        orders = context.getValue<OrderService>('orderService');
    });

    afterAll(() => {
        context.close();
    });

    test('the constructor entry is resolved lazily through the container', () => {
        expect(orders).toBeInstanceOf(OrderService);
    });

    test('advised calls are recorded by the registered interceptor', () => {
        expect(orders.place('widget')).toBe('ok:widget');
        expect(audit.entries()).toEqual(['order.place:place']);
    });

    test('plain methods run unrecorded on the same proxy', () => {
        expect(orders.placed()).toEqual(['widget']);
        expect(audit.entries()).toEqual(['order.place:place']);
    });

    test('private state is preserved through the woven proxy', () => {
        expect(orders.place('gadget')).toBe('ok:gadget');
        expect(orders.placed()).toEqual(['widget', 'gadget']);
        expect(audit.entries()).toEqual(['order.place:place', 'order.place:place']);
    });
});
