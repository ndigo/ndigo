/**
 * The `ndigo ai` route map: version-matched agent context management.
 */
import { buildRouteMap } from '@stricli/core';
import { aiCheckCommand } from './check.js';
import { aiInitCommand } from './init.js';
import { aiUpdateCommand } from './update.js';

/**
 * The AI route map registered under the root CLI.
 */
export const aiRouteMap = buildRouteMap({
    routes: {
        init: aiInitCommand,
        check: aiCheckCommand,
        update: aiUpdateCommand,
    },
    docs: { brief: 'Version-matched agent context (AGENTS.md, skills, MCP)' },
});
