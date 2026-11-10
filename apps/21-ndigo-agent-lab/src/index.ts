/**
 * Agent Lab: run a local OpenAI-compatible model through the Ndigo tool loop
 * and stream the result over SSE.
 *
 *     pnpm --filter @ndigo/agent-lab start
 *     curl -N -X POST localhost:3210/api/chat \
 *       -H 'content-type: application/json' \
 *       -d '{"prompt":"What did Ada order?"}'
 */
import 'node:process';
import '@tsmetadata/polyfill';
import { getLogger } from '@ndigo/log';
import { runNodeApplication } from '@ndigo/platform-node';
import { configureTelemetry } from '@ndigo/telemetry-node';
import { AgentLabConfiguration } from './agent-lab-configuration';
import { AgentLabConfig } from './agent-lab-config';

process.env['PORT'] ??= '3210';

// Console trace export keeps the demo dependency-free: one trace covers the
// root chat span, each tool execution, and the provider call timing.
configureTelemetry({ traceExporter: 'console', metricExporter: 'none', logExporter: 'none' });

const logger = getLogger('ndigo-agent-lab');

await runNodeApplication([AgentLabConfiguration, AgentLabConfig], {
    properties: { 'feature.ai.chat': true },
});

logger.info('agent lab listening on http://127.0.0.1:3210');
