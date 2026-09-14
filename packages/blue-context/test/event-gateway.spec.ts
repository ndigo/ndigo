/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';
import {
    ContextEventGateway,
    InvalidRelayError,
    NamespaceRelayValidationStrategy,
    type RelayValidationResult,
} from '../src/event-gateway';

describe('ContextEventGateway', () => {
    test('it should relay allowlisted events from source to target', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const listener = vi.fn();

        target.on('site:nav:badge:update', listener);

        const gateway = new ContextEventGateway(source, target, [
            {
                from: 'todo:stats:updated',
                to: 'site:nav:badge:update',
            },
        ]);

        source.emit('todo:stats:updated', 7);
        source.emit('todo:user:created', 1);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(7);

        gateway.destroy();
        source.destroy();
        target.destroy();
    });

    test('it should stop relaying after destroy', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const listener = vi.fn();

        target.on('site:command:refresh', listener);

        const gateway = new ContextEventGateway(source, target, [
            {
                from: 'site:command:refresh',
                to: 'site:command:refresh',
            },
        ]);

        source.emit('site:command:refresh');
        gateway.destroy();
        source.emit('site:command:refresh');

        expect(listener).toHaveBeenCalledTimes(1);
        expect(gateway.destroyed).toBe(true);

        source.destroy();
        target.destroy();
    });

    test('it should support dynamic relay registration while connected', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const listener = vi.fn();

        target.on('site:nav:title:update', listener);

        const gateway = new ContextEventGateway(source, target);
        gateway.addRelay('todo:title:changed', 'site:nav:title:update');

        source.emit('todo:title:changed', 'Todo');

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith('Todo');

        gateway.destroy();
        source.destroy();
        target.destroy();
    });

    test('it should expose relay metrics counters', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const listener = vi.fn();

        target.on('site:nav:badge:update', listener);

        const gateway = new ContextEventGateway(source, target, [
            {
                from: 'todo:stats:updated',
                to: 'site:nav:badge:update',
            },
        ]);

        source.emit('todo:stats:updated', 1);
        source.emit('todo:stats:updated', 2);

        expect(gateway.activeRelayCount).toBe(1);
        expect(gateway.blockedRelayCount).toBe(0);
        expect(gateway.relayedEventCount).toBe(2);
        expect(listener).toHaveBeenCalledTimes(2);

        gateway.destroy();
        source.destroy();
        target.destroy();
    });

    test('it should expose blocked relays when validation rejects relay', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const onRelayBlocked = vi.fn();
        const validation = new NamespaceRelayValidationStrategy({
            featureNamespace: 'todo',
        });
        const gateway = new ContextEventGateway(source, target, [], {
            validationStrategy: validation,
            diagnosticHandler: {
                onRelayBlocked,
            },
        });

        gateway.addRelay('admin:stats:updated', 'site:nav:badge:update');

        expect(gateway.hasBlockedRelays()).toBe(true);
        expect(gateway.blockedRelays).toHaveLength(1);
        const blocked = gateway.blockedRelays[0] as RelayValidationResult;
        expect(blocked.valid).toBe(false);
        expect(blocked.relay.from).toBe('admin:stats:updated');
        expect(onRelayBlocked).toHaveBeenCalledTimes(1);

        gateway.destroy();
        source.destroy();
        target.destroy();
    });

    test('it should throw InvalidRelayError when throwOnInvalid is enabled', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const validation = new NamespaceRelayValidationStrategy({
            featureNamespace: 'todo',
        });
        const gateway = new ContextEventGateway(source, target, [], {
            throwOnInvalid: true,
            validationStrategy: validation,
        });

        expect(() => {
            gateway.addRelay('account:user:updated', 'site:nav:badge:update');
        }).toThrowError(InvalidRelayError);

        gateway.destroy();
        source.destroy();
        target.destroy();
    });

    test('it should allow namespaced relays for site and feature domains', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const listener = vi.fn();

        target.on('site:nav:title:update', listener);

        const gateway = new ContextEventGateway(source, target, [], {
            validationStrategy: new NamespaceRelayValidationStrategy({
                featureNamespace: 'todo',
            }),
        });

        gateway.addRelay('todo:title:changed', 'site:nav:title:update');
        source.emit('todo:title:changed', 'Todo');

        expect(listener).toHaveBeenCalledTimes(1);
        expect(gateway.hasBlockedRelays()).toBe(false);

        gateway.destroy();
        source.destroy();
        target.destroy();
    });

    test('it should track blocked relay count when validation rejects relays', () => {
        const source = new GenericApplicationContext('source');
        const target = new GenericApplicationContext('target');
        const gateway = new ContextEventGateway(source, target, [], {
            validationStrategy: new NamespaceRelayValidationStrategy({
                featureNamespace: 'todo',
            }),
        });

        gateway.addRelay('admin:stats:updated', 'site:nav:badge:update');
        gateway.addRelay('ops:stats:updated', 'site:nav:badge:update');

        expect(gateway.activeRelayCount).toBe(0);
        expect(gateway.blockedRelayCount).toBe(2);
        expect(gateway.relayedEventCount).toBe(0);

        gateway.destroy();
        source.destroy();
        target.destroy();
    });
});
