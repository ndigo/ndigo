/**
 * Complete catalog of the design tokens declared in `tokens/ndigo-tokens.css`.
 *
 * The catalog is the machine-readable half of the token contract: the test
 * suite asserts it stays in lockstep with the stylesheet, and consumers use it
 * for documentation, autocomplete, and drift checks.
 */
import type { TokenDefinition } from './token-definition.js';
import type { TokenName } from './token-name.js';

export const TOKENS = [
    // Brand palette
    {
        name: '--nd-palette-indigo-deep',
        group: 'palette',
        description: 'Deep indigo, the first stop of the brand gradient.',
    },
    { name: '--nd-palette-violet', group: 'palette', description: 'Violet, the mid stop of the brand gradient.' },
    {
        name: '--nd-palette-violet-bright',
        group: 'palette',
        description: 'Bright violet, the final stop of the brand gradient.',
    },
    {
        name: '--nd-gradient-brand',
        group: 'palette',
        description: 'Brand gradient spanning the three palette stops.',
    },

    // Semantic colors
    { name: '--nd-color-bg', group: 'color', description: 'Page background.' },
    { name: '--nd-color-surface', group: 'color', description: 'Default surface for panels and cards.' },
    { name: '--nd-color-surface-raised', group: 'color', description: 'Raised surface for menus and popovers.' },
    { name: '--nd-color-text', group: 'color', description: 'Primary text.' },
    { name: '--nd-color-text-muted', group: 'color', description: 'Secondary and supporting text.' },
    { name: '--nd-color-border', group: 'color', description: 'Hairline borders and dividers.' },
    { name: '--nd-color-code-bg', group: 'color', description: 'Background for inline and block code.' },
    { name: '--nd-color-accent', group: 'color', description: 'Brand accent for interactive surfaces.' },
    { name: '--nd-color-accent-strong', group: 'color', description: 'High-contrast accent for text and icons.' },
    { name: '--nd-color-accent-soft', group: 'color', description: 'Translucent accent for tints and hover fills.' },
    { name: '--nd-color-on-accent', group: 'color', description: 'Text and icons placed on the accent color.' },
    { name: '--nd-color-success', group: 'color', description: 'Positive status.' },
    { name: '--nd-color-warning', group: 'color', description: 'Caution status.' },
    { name: '--nd-color-danger', group: 'color', description: 'Destructive or error status.' },
    { name: '--nd-color-info', group: 'color', description: 'Informational status.' },

    // Typography
    { name: '--nd-font-display', group: 'typography', description: 'Display face for the wordmark and headings.' },
    { name: '--nd-font-sans', group: 'typography', description: 'Body text face.' },
    { name: '--nd-font-mono', group: 'typography', description: 'Monospace face for code.' },
    { name: '--nd-text-xs', group: 'typography', description: 'Extra-small text.' },
    { name: '--nd-text-sm', group: 'typography', description: 'Small text.' },
    { name: '--nd-text-base', group: 'typography', description: 'Base body text.' },
    { name: '--nd-text-lg', group: 'typography', description: 'Large text.' },
    { name: '--nd-text-xl', group: 'typography', description: 'Extra-large text.' },
    { name: '--nd-text-2xl', group: 'typography', description: 'Section heading text.' },
    { name: '--nd-text-3xl', group: 'typography', description: 'Page heading text.' },
    { name: '--nd-text-4xl', group: 'typography', description: 'Display heading text.' },
    { name: '--nd-leading-tight', group: 'typography', description: 'Tight line height for headings.' },
    { name: '--nd-leading-normal', group: 'typography', description: 'Default line height for body text.' },
    { name: '--nd-leading-relaxed', group: 'typography', description: 'Relaxed line height for long-form text.' },
    { name: '--nd-weight-regular', group: 'typography', description: 'Regular weight.' },
    { name: '--nd-weight-medium', group: 'typography', description: 'Medium weight for emphasis and controls.' },
    { name: '--nd-weight-semibold', group: 'typography', description: 'Semibold weight for headings.' },
    { name: '--nd-weight-bold', group: 'typography', description: 'Bold weight for strong emphasis.' },
    { name: '--nd-tracking-tight', group: 'typography', description: 'Tight tracking for large headings.' },
    { name: '--nd-tracking-wide', group: 'typography', description: 'Wide tracking for wordmarks and labels.' },

    // Spacing
    { name: '--nd-space-0', group: 'space', description: 'Zero spacing.' },
    { name: '--nd-space-1', group: 'space', description: '4px spacing step.' },
    { name: '--nd-space-2', group: 'space', description: '8px spacing step.' },
    { name: '--nd-space-3', group: 'space', description: '12px spacing step.' },
    { name: '--nd-space-4', group: 'space', description: '16px spacing step.' },
    { name: '--nd-space-6', group: 'space', description: '24px spacing step.' },
    { name: '--nd-space-8', group: 'space', description: '32px spacing step.' },
    { name: '--nd-space-12', group: 'space', description: '48px spacing step.' },
    { name: '--nd-space-16', group: 'space', description: '64px spacing step.' },

    // Radius
    { name: '--nd-radius-sm', group: 'radius', description: 'Small radius for inputs and chips.' },
    { name: '--nd-radius-md', group: 'radius', description: 'Default radius for buttons and cards.' },
    { name: '--nd-radius-lg', group: 'radius', description: 'Large radius for panels and sheets.' },
    { name: '--nd-radius-xl', group: 'radius', description: 'Extra-large radius for hero surfaces.' },
    { name: '--nd-radius-full', group: 'radius', description: 'Fully rounded pill or circle.' },

    // Elevation
    { name: '--nd-shadow-sm', group: 'elevation', description: 'Subtle elevation for inline affordances.' },
    { name: '--nd-shadow-md', group: 'elevation', description: 'Default elevation for cards and popovers.' },
    { name: '--nd-shadow-lg', group: 'elevation', description: 'Strong elevation for modals and overlays.' },
    { name: '--nd-shadow-brand', group: 'elevation', description: 'Brand-tinted glow used on hero surfaces.' },

    // Motion
    { name: '--nd-duration-fast', group: 'motion', description: 'Duration for hover and press feedback.' },
    { name: '--nd-duration-base', group: 'motion', description: 'Default duration for transitions.' },
    { name: '--nd-duration-slow', group: 'motion', description: 'Duration for larger surface transitions.' },
    { name: '--nd-ease-standard', group: 'motion', description: 'Default easing curve.' },
    { name: '--nd-ease-emphasized', group: 'motion', description: 'Easing curve for entering and exiting surfaces.' },

    // Stacking order
    { name: '--nd-z-base', group: 'z', description: 'Base stacking context.' },
    { name: '--nd-z-raised', group: 'z', description: 'Raised content.' },
    { name: '--nd-z-dropdown', group: 'z', description: 'Menus and popovers.' },
    { name: '--nd-z-sticky', group: 'z', description: 'Sticky headers.' },
    { name: '--nd-z-overlay', group: 'z', description: 'Backdrops and scrims.' },
    { name: '--nd-z-modal', group: 'z', description: 'Dialogs and sheets.' },
    { name: '--nd-z-toast', group: 'z', description: 'Toasts and notifications.' },
    { name: '--nd-z-tooltip', group: 'z', description: 'Tooltips.' },

    // Focus
    { name: '--nd-focus-ring-width', group: 'focus', description: 'Outline width for the focus ring.' },
    { name: '--nd-focus-ring-color', group: 'focus', description: 'Outline color for the focus ring.' },
    { name: '--nd-focus-ring-offset', group: 'focus', description: 'Outline offset for the focus ring.' },
] as const satisfies readonly TokenDefinition[];

const DEFINITIONS_BY_NAME = new Map<string, TokenDefinition>(TOKENS.map((token) => [token.name, token]));

/**
 * Every token name in the catalog, in declaration order.
 */
export const TOKEN_NAMES: readonly TokenName[] = TOKENS.map((token) => token.name);

/**
 * Looks up the catalog definition for a token name.
 * @param name - Token name to find.
 * @returns The definition, or `undefined` when the name is not catalogued.
 */
export function getTokenDefinition(name: TokenName): TokenDefinition | undefined {
    return DEFINITIONS_BY_NAME.get(name);
}
