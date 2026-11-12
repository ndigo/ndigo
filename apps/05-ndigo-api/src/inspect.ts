/**
 * `ndigo inspect` demo entry point — builds the application manifest without
 * listening on a port (OP: introspection substrate, AD-70).
 *
 * Boots the same assembly as `src/index.ts`, enumerates routes, handler
 * mappings and declared configuration keys through `@ndigo/inspect`, prints the
 * manifest as pretty JSON and exits. No HTTP server is started: `run()` builds
 * and refreshes the context; only `server.start()` (which this entry omits)
 * would bind a port.
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { getEnv } from '@ndigo/context';
import { DISPATCHER, type AbstractDispatcher } from '@ndigo/dispatcher';
import { inspectApplication } from '@ndigo/inspect';
import { ManagementConfiguration } from './management-configuration';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { RouteRegistry } from '@ndigo/router';
import { getErrorMessage } from '@ndigo/util';
import { getLogger } from '@ndigo/log';
import { NodeAppConfiguration } from './node-app-configuration';
import { SecureDocsConfiguration } from './secure-docs-configuration';
import { ServerConfig, SecretsConfig } from './server-config';
import { GreetingController } from './greeting-controller';
import { AuthController } from './auth-controller';
import { ChatController } from './chat-controller';
import { StompChatController } from './stomp-chat-controller';
import { NoteController } from './note-controller';
import { DrizzleNoteController } from './drizzle-note-controller';
import { ProductController } from './product-controller';
import { CachedReportController } from './cached-report-controller';
import { ConfigSecretsController } from './config-secrets-controller';
import { ConfigServerDemoController } from './config-server-demo-controller';
import { UploadController } from './upload-controller';

const logger = getLogger('ndigo-api:inspect');

/**
 * The app's route-decorated controllers. Boot scans only the builder's
 * source classes into its `routeRegistry`, and these are registered as
 * `@entry` entries rather than sources — so the inspect demo scans them
 * explicitly, the same way `apps/03-ndigo-todo-web` supplements a missing registry.
 */
const CONTROLLERS = [
    GreetingController,
    AuthController,
    ChatController,
    StompChatController,
    NoteController,
    DrizzleNoteController,
    ProductController,
    CachedReportController,
    ConfigSecretsController,
    ConfigServerDemoController,
    UploadController,
];

async function main() {
    const builder = new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementConfiguration,
        SecureDocsConfiguration,
        ServerConfig,
        SecretsConfig,
        NodeAppConfiguration,
    ])
        .profiles('dev')
        .properties({ 'server.port': getEnv('PORT') ?? '3000', 'server.name': 'ndigo-api' });

    const context = await builder.run();

    const routes = new RouteRegistry();
    routes.scanSources(CONTROLLERS, context);
    const dispatcher = context.getValue<AbstractDispatcher>(DISPATCHER);

    const manifest = inspectApplication({
        context,
        routes,
        mappings: dispatcher,
        configurationClasses: [ServerConfig, SecretsConfig],
    });

    const json = `${JSON.stringify(manifest, null, 2)}\n`;
    await new Promise<void>((resolve, reject) => {
        process.stdout.write(json, 'utf8', (error) => (error ? reject(error) : resolve()));
    });

    context.close();
}

main().then(
    () => process.exit(0),
    (err) => {
        logger.error(`inspect failed: ${getErrorMessage(err)}`);
        process.exit(1);
    }
);
