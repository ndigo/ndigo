/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry, profile } from '@blue/context';
import { StaticContentSource } from '@blue/content';
import { type MediaType, MediaTypes } from '@blue/core';
import { StaticController, type SocketRequestAuthenticator } from '@blue/platform-node';
import type { SocketRequestSources } from '@blue/dispatcher';
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
    type ViewResolver,
    CSVView,
    JSONView,
} from '@blue/view';
import { GreetingController } from './greeting-controller';
import { Heartbeat } from './heartbeat';
import { AuthController } from './auth-controller';
import { ChatController } from './chat-controller';
import { StompChatController } from './stomp-chat-controller';
import { NoteController } from './note-controller';
import { DrizzleNoteController } from './drizzle-note-controller';
import { ProductController } from './product-controller';
import { CachedReportController } from './cached-report-controller';
import { lookupPrincipal } from './auth-store';

const requireMediaType = (value: MediaType | null): MediaType => {
    if (value === null) {
        throw new Error('expected a registered media type');
    }
    return value;
};

/**
 * Reads the demo credential off the WebSocket handshake: `?token=` (the
 * only channel a WHATWG `WebSocket` client can use) or an
 * `Authorization: Bearer <token>` header for non-browser clients.
 *
 * @param sources - The upgrade request sources.
 * @returns The token, or `null` when the handshake carries none.
 */
function upgradeToken(sources: SocketRequestSources): string | null {
    const queryToken = sources.query['token'];
    const fromQuery = Array.isArray(queryToken) ? queryToken[0] : queryToken;
    if (typeof fromQuery === 'string' && fromQuery !== '') {
        return fromQuery;
    }
    const authorization = sources.headers['authorization'];
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
        const token = header.slice('Bearer '.length).trim();
        return token === '' ? null : token;
    }
    return null;
}

@configuration
export class NodeAppConfiguration {
    @entry greetingController() {
        return new GreetingController(
            new StaticContentSource({
                greeting: {
                    en: 'Hello, {name}!',
                    de: 'Hallo, {name}!',
                    fr: 'Bonjour, {name}!',
                },
            })
        );
    }
    @entry authController() {
        return new AuthController();
    }
    @entry chatController() {
        return new ChatController();
    }
    @entry stompChatController() {
        return new StompChatController();
    }

    /**
     * Socket identity source (SEC-3): `HTTPServer` resolves this bean and
     * hands its `authenticate` method to the adapter's upgrade hook, so
     * socket identity is wired declaratively like any other bean.
     *
     * A `?token=` query parameter (the channel a WHATWG `WebSocket` client
     * can actually use) or an `Authorization: Bearer …` header resolves
     * through the app's own `lookupPrincipal`. The returned bag carries
     * `principal` — the identity `@authenticated`/`@authorized` socket
     * handlers enforce at dispatch — plus `user`, which makes the STOMP
     * broker's `/user/*` scope real.
     *
     * No credential ⇒ anonymous `{}`: the raw `/ws/chat` endpoint stays a
     * public socket (the documented contrast), while `@authenticated`
     * endpoints such as `/stomp/chat` fail closed with `1008`. A
     * presented-but-unknown token is a failed authentication, not
     * anonymity: `authenticate` returns `null` and the upgrade is refused
     * with `1008`.
     */
    @entry
    socketRequestAuthenticator(): SocketRequestAuthenticator {
        return {
            authenticate(sources: SocketRequestSources) {
                const token = upgradeToken(sources);
                if (token === null) {
                    return {};
                }
                const principal = lookupPrincipal(token);
                if (principal === null) {
                    return null;
                }
                return { principal, user: principal.id };
            },
        };
    }

    @entry noteController() {
        return new NoteController();
    }
    @entry drizzleNoteController() {
        return new DrizzleNoteController();
    }
    @entry productController() {
        return new ProductController();
    }
    @entry cachedReportController() {
        return new CachedReportController();
    }
    @entry staticController() {
        return new StaticController();
    }

    /**
     * The scheduled heartbeat (AD-20 demo gate): a registered bean picked
     * up by the node platform's scheduler auto-discovery — zero wiring.
     */
    @entry
    heartbeat() {
        return new Heartbeat();
    }

    /**
     * Management endpoints (`/health`, `/metrics`) come from
     * `ManagementAutoConfiguration` (registered in the app entry) — its
     * `handlerMappings` collection now supplements rather than replaces the
     * platform mapping.
     */

    /**
     * Profile-gated bean (AD-14): registered only when the `dev` profile is
     * active — `ApplicationBuilder.profiles('dev')` in the app entry.
     */
    @profile('dev')
    @entry
    devInfo() {
        return { flavor: 'dev', note: 'profile-gated bean (AD-14)' };
    }

    /**
     * Content-negotiating view resolver: the same logical `report` view is
     * served as JSON (default) or CSV (`.csv` path extension) — the
     * representation-family demo (JSONView / CSVView).
     */
    @entry
    viewResolver() {
        const jsonReport: ViewResolver = {
            resolveViewName: async (name: string) => (name === 'report' ? new JSONView() : null),
        };
        const csvReport: ViewResolver = {
            resolveViewName: async (name: string) => (name === 'report' ? new CSVView({ records: 'rows' }) : null),
        };
        const manager = new ContentNegotiationManager([
            new PathExtensionContentNegotiationStrategy(
                new Map([
                    ['json', requireMediaType(MediaTypes.APPLICATION_JSON)],
                    ['csv', requireMediaType(MediaTypes.TEXT_CSV)],
                ])
            ),
        ]);
        const resolver = new ContentNegotiationViewResolver(manager);
        resolver.viewResolvers = [jsonReport, csvReport];
        return resolver;
    }
}
