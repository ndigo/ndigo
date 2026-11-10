/**
 * MCP stdio server: the same `@toolMapping` handlers the chat agent calls,
 * exposed to any MCP host.
 *
 *     pnpm --filter @ndigo/agent-lab mcp
 */
import 'node:process';
import '@tsmetadata/polyfill';
import { ApplicationBuilder } from '@ndigo/boot';
import { ARGUMENT_RESOLVERS, DISPATCHER } from '@ndigo/dispatcher';
import { McpToolRegistry, startStdioServer } from '@ndigo/mcp';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { AgentLabConfiguration } from './agent-lab-configuration';
import { AgentLabConfig } from './agent-lab-config';
import { ordersUi } from './orders-ui';

const context = await new ApplicationBuilder([NodeAutoConfiguration, AgentLabConfiguration, AgentLabConfig])
    .properties({ 'feature.ai.chat': true })
    .run();
const registry = McpToolRegistry.from(context.getValue(DISPATCHER), {
    readOnly: true,
    argumentResolvers: context.getValue(ARGUMENT_RESOLVERS),
});
await startStdioServer(registry, { name: 'ndigo-agent-lab', uiResources: [ordersUi] });

process.on('SIGINT', () => {
    context.close();
});
