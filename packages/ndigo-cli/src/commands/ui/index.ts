/**
 * The `ndigo ui` route map: registry inspection and installation.
 */
import { buildRouteMap } from '@stricli/core';
import { addUiCommand } from './add.js';
import { catalogUiCommand } from './catalog.js';
import { initUiCommand } from './init.js';
import { listUiCommand } from './list.js';
import { mcpUiCommand } from './mcp.js';
import { validateUiCommand } from './validate.js';
import { viewUiCommand } from './view.js';

/**
 * The UI route map registered under the root CLI.
 */
export const uiRouteMap = buildRouteMap({
    routes: {
        init: initUiCommand,
        add: addUiCommand,
        list: listUiCommand,
        catalog: catalogUiCommand,
        view: viewUiCommand,
        validate: validateUiCommand,
        mcp: mcpUiCommand,
    },
    docs: { brief: 'Inspect and install Ndigo UI registry items' },
});
