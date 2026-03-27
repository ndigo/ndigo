import { composeTodoRuntime, toTodoShellRoute } from './shell-composition';
import todoContext from './todo-context';
import './account-app-view';
import './feature-metrics-panel-view';
import './shell-nav-view';
import './todo-app-view';
import './todo-input-view';
import './todo-item-view';

const composition = composeTodoRuntime(todoContext);
const metricsPanel = document.createElement('feature-metrics-panel') as HTMLElement & {
    aggregator?: unknown;
    refresh?: () => void;
    routeHandledRateAlertThreshold?: number;
};

metricsPanel.aggregator = composition.featureMetrics;
metricsPanel.routeHandledRateAlertThreshold = 5;
document.body.appendChild(metricsPanel);

window.setInterval(() => {
    metricsPanel.refresh?.();
}, 250);

location.hash = toTodoShellRoute('/index');
