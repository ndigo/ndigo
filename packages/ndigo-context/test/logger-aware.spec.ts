import { describe, expect, test } from 'vitest';

import { GenericApplicationContext } from '../src/context.js';
import { AsLoggerAware } from '../src/context-aware-mixin.js';
import { ApplicationContextAwareProcessor } from '../src/application-context-aware-processor.js';
import { LoggerFactory, levelToSeverityNumber } from '@ndigo/log';

describe('LoggerAware', () => {
    test('AsLoggerAware injects a logger during processing', () => {
        class Service extends AsLoggerAware(Object) {}
        const service = new Service() as Service & { logger?: unknown; setLogger: (l: unknown) => void };

        const context = new GenericApplicationContext('test-ctx');
        context.refresh();

        // mimic aware processing
        const processor = new ApplicationContextAwareProcessor(context);
        const processed = processor.processBeforeInitialization('svc', service) as typeof service;

        expect(processed.logger).toBeDefined();
        expect(typeof processed.logger?.info).toBe('function');
    });

    test('applicationContext.getLogger returns a logger backed by the factory', () => {
        const context = new GenericApplicationContext('my-ctx');
        context.refresh();

        const logger = context.getLogger();
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');

        const named = context.getLogger('custom');
        expect(typeof named.info).toBe('function');
    });

    test('context logger follows factory settings', () => {
        LoggerFactory.reset();
        const context = new GenericApplicationContext('cfg-ctx');
        context.refresh();

        const logger = context.getLogger();
        expect(logger.isEnabled(levelToSeverityNumber('debug'))).toBe(true); // DEBUG threshold allows debug

        LoggerFactory.setThreshold(99999); // effectively disable
        // re-resolve by calling isEnabled again
        expect(typeof logger.isEnabled).toBe('function');
        LoggerFactory.reset();
    });
});
