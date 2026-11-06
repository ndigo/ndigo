/**
 */
import {
    CounterRateResolver,
    type CounterRateAlert,
    type CounterRateSnapshot,
    type FeatureMetricAggregator,
    type FeatureMetrics,
} from '@ndigo/telemetry';

const featureMetricsPanelTemplate = document.createElement('template');
featureMetricsPanelTemplate.innerHTML = `
    <aside class="feature-metrics-panel">
        <h3>Feature Metrics</h3>
        <div class="feature-metrics-content"></div>
    </aside>
`;

class FeatureMetricsPanel extends HTMLElement {
    #aggregator: FeatureMetricAggregator | undefined;
    #counterRateResolver: CounterRateResolver | undefined;
    #routeHandledRateAlertThreshold: number | undefined;

    $content: HTMLElement | null = null;

    set routeHandledRateAlertThreshold(value: number | undefined) {
        this.#routeHandledRateAlertThreshold = value;
    }

    set aggregator(aggregator: FeatureMetricAggregator | undefined) {
        this.#aggregator = aggregator;
        this.#counterRateResolver = aggregator
            ? new CounterRateResolver({
                  aggregator,
              })
            : undefined;
        this.refresh();
    }

    constructor() {
        super();
    }

    #syncRouteHandledThresholds(): void {
        if (!this.#counterRateResolver) {
            return;
        }

        this.#counterRateResolver.clearThresholds();

        const threshold = this.#routeHandledRateAlertThreshold;

        if (typeof threshold !== 'number') {
            return;
        }

        for (const feature of this.#aggregator?.featureNames ?? []) {
            this.#counterRateResolver.setThreshold(`${feature}.routeHandledCount`, threshold);
        }
    }

    connectedCallback() {
        this.appendChild(featureMetricsPanelTemplate.content.cloneNode(true));
        this.$content = this.querySelector('.feature-metrics-content');
        this.refresh();
    }

    refresh() {
        if (!this.$content) {
            return;
        }

        this.#syncRouteHandledThresholds();

        const featureNames = this.#aggregator?.featureNames ?? [];

        if (featureNames.length === 0) {
            this.$content.textContent = 'No feature metrics available yet.';

            return;
        }

        const counterRateSnapshots = this.#counterRateResolver?.resolve() ?? [];
        const counterRateAlerts = this.#counterRateResolver?.resolveAlerts(counterRateSnapshots) ?? [];

        this.$content.innerHTML = featureNames
            .map((featureName) => this.#aggregator?.getFeatureMetrics(featureName))
            .filter((metrics): metrics is FeatureMetrics => Boolean(metrics))
            .map((metrics) => this.#renderFeatureMetrics(metrics, counterRateSnapshots, counterRateAlerts))
            .join('');
    }

    #renderFeatureMetrics(
        metrics: FeatureMetrics,
        counterRateSnapshots: readonly CounterRateSnapshot[],
        counterRateAlerts: readonly CounterRateAlert[]
    ): string {
        const counters = Array.from(metrics.counters.entries())
            .map(([name, value]) => `<li><strong>${name}</strong>: ${String(value)}</li>`)
            .join('');

        const gauges = Array.from(metrics.gauges.entries())
            .map(([name, value]) => `<li><strong>${name}</strong>: ${String(value)}</li>`)
            .join('');

        const routeHandledCounterKey = `${metrics.feature}.routeHandledCount`;
        const routeHandledRatePerSecond =
            counterRateSnapshots.find((snapshot) => snapshot.counterKey === routeHandledCounterKey)?.ratePerSecond ?? 0;
        const routeHandledRateLabel = `${routeHandledRatePerSecond.toFixed(2)}/s`;
        const alert = counterRateAlerts.find((a) => a.counterKey === routeHandledCounterKey);
        const alertLabel = alert ? ` <em>(ALERT: > ${alert.threshold.toFixed(2)}/s)</em>` : '';

        return `
            <section class="feature-metrics-item" data-feature="${metrics.feature}">
                <h4>${metrics.feature}</h4>
                <div><strong>Counters</strong></div>
                <ul>${counters || '<li>None</li>'}</ul>
                <div><strong>Gauges</strong></div>
                <ul>${gauges || '<li>None</li>'}</ul>
                <div><strong>Derived</strong></div>
                <ul>
                    <li class="derived-route-rate"><strong>${metrics.feature}.routeHandledRate</strong>: ${routeHandledRateLabel}${alertLabel}</li>
                </ul>
            </section>
        `;
    }
}

window.customElements.define('feature-metrics-panel', FeatureMetricsPanel);

export default FeatureMetricsPanel;
