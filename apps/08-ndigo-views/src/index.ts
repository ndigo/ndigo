/**
 */
import { configureBrowserTelemetry } from '@ndigo/telemetry-web';
import { createWebApplication } from '@ndigo/platform-web';
import { ViewsAppConfiguration } from './views-app-configuration';
import './components/shell-component';

// Browser telemetry (browser→server journey): W3C trace context is
// propagated into outgoing requests by TraceHeaderInterceptor; the client
// demo's span becomes the parent of ndigo-api's server span. Point `traceUrl`
// at a local OpenTelemetry Collector (OTLP/HTTP) to export spans there —
// the console exporter is the default dev posture.
configureBrowserTelemetry({ serviceName: 'ndigo-views' });

// Lifecycle preset (AD-90): builds the container (WebAutoConfiguration +
// ViewsAppConfiguration), wires the router, dispatcher, and DOM view target,
// registers the runtime tokens, and navigates to the URL's current route.
await createWebApplication([ViewsAppConfiguration]);
