// @vitest-environment jsdom

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FeatureMetricAggregator } from '@blue/telemetry';
import '../src/feature-metrics-panel-view';

interface FeatureMetricsPanelElement extends HTMLElement {
    aggregator: FeatureMetricAggregator;
    routeHandledRateAlertThreshold?: number;
    refresh: () => void;
}

describe('feature-metrics-panel view', () => {
    let element: FeatureMetricsPanelElement;

    beforeEach(() => {
        document.body.innerHTML = '';
        element = document.createElement('feature-metrics-panel') as FeatureMetricsPanelElement;
        document.body.appendChild(element);
    });

    test('renders fallback text when no metrics are available', async () => {
        element.aggregator = new FeatureMetricAggregator();

        await Promise.resolve();

        expect(element.textContent).toContain('No feature metrics available yet.');
    });

    test('renders counters and gauges grouped by feature', async () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.incrementCounter('todo', 'todo.mountCount', 2);
        aggregator.setGauge('todo', 'todo.activeRelayCount', 1);
        aggregator.incrementCounter('account', 'account.routeHandledCount', 3);

        element.aggregator = aggregator;
        element.refresh();

        await Promise.resolve();

        const todoSection = element.querySelector('[data-feature="todo"]');
        const accountSection = element.querySelector('[data-feature="account"]');

        expect(todoSection?.textContent).toContain('todo.mountCount');
        expect(todoSection?.textContent).toContain('todo.activeRelayCount');
        expect(accountSection?.textContent).toContain('account.routeHandledCount');
    });

    test('renders derived routeHandledRate and alert threshold label', async () => {
        const aggregator = new FeatureMetricAggregator();

        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('account', 'account.routeHandledCount', 0);
        element.aggregator = aggregator;
        element.refresh();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('account', 'account.routeHandledCount', 10);
        element.routeHandledRateAlertThreshold = 5;
        element.refresh();

        await Promise.resolve();

        const rateItem = element.querySelector('[data-feature="account"] .derived-route-rate');

        expect(rateItem?.textContent).toContain('account.routeHandledRate');
        expect(rateItem?.textContent).toContain('10.00/s');
        expect(rateItem?.textContent).toContain('ALERT: > 5.00/s');

        nowSpy.mockRestore();
    });
});
