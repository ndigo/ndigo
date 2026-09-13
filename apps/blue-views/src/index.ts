import { MetadataConfigApplicationContext } from '@blue/context';
import { configureBrowserTelemetry } from '@blue/telemetry-web';
import { WebAutoConfiguration } from '@blue/platform-web';
import { BrowserDispatcher, HashRouter } from '@blue/platform-web';
import { DOMElementViewTarget } from '@blue/view-webcomponent';
import type { Route } from '@blue/router';
import { ViewsAppConfiguration } from './views-app-configuration';
import './components/shell-component';

// Browser telemetry (browser→server journey): W3C trace context is
// propagated into outgoing requests by TraceHeaderInterceptor; the client
// demo's span becomes the parent of blue-api's server span. Point `traceUrl`
// at a local OpenTelemetry Collector (OTLP/HTTP) to export spans there —
// the console exporter is the default dev posture.
configureBrowserTelemetry({ serviceName: 'blue-views' });

const viewsContext = new MetadataConfigApplicationContext('blue-views');
viewsContext.register(WebAutoConfiguration);
viewsContext.register(ViewsAppConfiguration);
viewsContext.refresh();

// The real app renders into #app (tests provide their own view target).
viewsContext.setValue('viewTarget', new DOMElementViewTarget(document.getElementById('app')));

const dispatcher = new BrowserDispatcher();
dispatcher.initStrategies(viewsContext);
dispatcher.applicationContext = viewsContext;

const router = new HashRouter((route: Route) => {
    void dispatcher.dispatch(route);
});

if (location.hash === '#/') {
    router.refresh();
} else {
    location.hash = '/';
}
