import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { resolve } from 'node:path';
import { StaticController } from '@blue/platform-node';
import { IslandController } from './island-controller';

/**
 * Blue Island configuration: the server-rendered island controller plus the
 * static client-bundle server (reuses the shared `StaticResourceResolver`).
 */
@configuration
export class IslandConfiguration {
    @entry
    islandController() {
        return new IslandController();
    }
    @entry
    staticController() {
        // Serve the Vite-built client bundle (dist/) — explicit base, no env.
        return new StaticController(resolve('dist'));
    }
}