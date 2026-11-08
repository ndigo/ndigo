/**
 * The `ndigo ui` route map: registry inspection and installation.
 */
import { buildRouteMap } from '@stricli/core';
import { addUiCommand } from './add.js';
import { initUiCommand } from './init.js';
import { listUiCommand } from './list.js';
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
        view: viewUiCommand,
        validate: validateUiCommand,
    },
    docs: { brief: 'Inspect and install Ndigo UI registry items' },
});
