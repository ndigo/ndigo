/**
 * @author Jeff Rose
 */

import { StandardEnvironment } from '@blue/context';
import { JSONObject } from '@blue/core';

/**
 * Node.js environment implementation that includes `process.env` as the first property source.
 *
 * Extends {@link StandardEnvironment} so that DI containers can discriminate between
 * browser and Node environments by class identity (e.g., `instanceof NodeEnvironment`).
 * All other environment behaviour (profiles, property resolution) is inherited.
 */
export class NodeEnvironment extends StandardEnvironment {
    /**
     * Creates a Node.js environment.
     *
     * @param propertySources - Additional property sources to merge (appended after `process.env`).
     */
    constructor(propertySources: JSONObject[] = []) {
        // process.env is the primary source; additional sources are merged after it
        super([...propertySources, process.env as unknown as JSONObject]);
    }
}