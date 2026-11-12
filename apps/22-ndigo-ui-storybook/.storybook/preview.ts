/**
 * Preview configuration for the Ndigo UI Storybook.
 *
 * Registers every registry component and stylesheet once, pins the color
 * scheme so stories render deterministically, and keeps canvas anchors from
 * navigating the preview iframe away from the story.
 */
import type { Decorator } from '@storybook/web-components-vite';

import '@ndigo/ui/tokens.css';
import '@ndigo/ui/theme.css';
import '../src/_register';

export const parameters = {
    controls: { expanded: true },
    // The token layer paints the canvas; a Storybook background would only
    // fight the light/dark switch.
    backgrounds: { disable: true },
    // Surface the components' documented custom events in the Actions panel.
    actions: { handles: [/^nd-/u] },
    a11y: { test: 'todo' },
};

export const globalTypes = {
    theme: {
        description: 'Ndigo color scheme',
        toolbar: {
            title: 'Theme',
            icon: 'contrast',
            items: [
                { value: 'dark', title: 'Dark' },
                { value: 'light', title: 'Light' },
            ],
            dynamicTitle: true,
        },
    },
};

/**
 * Dark is the brand default. Pinning `data-theme` also disables the tokens'
 * `prefers-color-scheme` fallback, so every visitor sees the same palette.
 */
export const initialGlobals = { theme: 'dark' };

const withTheme: Decorator = (story, context) => {
    document.documentElement.dataset.theme = String(context.globals.theme ?? 'dark');
    return story();
};

/**
 * Stories use the real registry markup, which includes live links. In the
 * preview iframe those would replace the story (or collide with Storybook's
 * own `?path=` routing), so swallow same-frame navigation.
 */
if (typeof document !== 'undefined') {
    document.addEventListener(
        'click',
        (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const anchor = target?.closest('a[href]');
            if (!anchor || anchor.getAttribute('target') === '_blank') return;
            event.preventDefault();
        },
        true
    );
}

export const decorators = [withTheme];
