/**
 * Fixture wiring for the capability-apply integration test: one entry that
 * makes the tool handler visible to the dispatcher and the MCP projection.
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { FixtureTools } from './tools';

/**
 * The fixture application composition.
 */
@configuration
export class FixtureConfiguration {
    readonly #tools = new FixtureTools();

    /**
     * @returns The fixture's tool handlers.
     */
    @entry()
    tools(): FixtureTools {
        return this.#tools;
    }
}
