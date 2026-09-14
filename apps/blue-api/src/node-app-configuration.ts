/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry, profile } from '@blue/context';
import { StaticContentSource } from '@blue/content';
import { type MediaType, MediaTypes } from '@blue/core';
import { StaticController } from '@blue/platform-node';
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
    type ViewResolver,
    CSVView,
    JSONView,
} from '@blue/view';
import { GreetingController } from './greeting-controller';
import { AuthController } from './auth-controller';
import { NoteController } from './note-controller';
import { DrizzleNoteController } from './drizzle-note-controller';
import { ProductController } from './product-controller';

const requireMediaType = (value: MediaType | null): MediaType => {
    if (value === null) {
        throw new Error('expected a registered media type');
    }
    return value;
};

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
    @entry noteController() {
        return new NoteController();
    }
    @entry drizzleNoteController() {
        return new DrizzleNoteController();
    }
    @entry productController() {
        return new ProductController();
    }
    @entry staticController() {
        return new StaticController();
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
