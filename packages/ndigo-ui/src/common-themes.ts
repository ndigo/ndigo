/**
 * Built-in themes shipped with `@ndigo/ui`.
 */
import type { Theme } from './theme.js';

const NDIGO_DARK_TOKENS = {
    '--nd-palette-indigo-deep': '#293896',
    '--nd-palette-violet': '#5b3be0',
    '--nd-palette-violet-bright': '#9a38ff',
    '--nd-gradient-brand': 'linear-gradient(135deg, #293896 0%, #5b3be0 45%, #9a38ff 100%)',
    '--nd-color-bg': '#0a0a14',
    '--nd-color-surface': '#13132a',
    '--nd-color-surface-raised': '#1c1c3a',
    '--nd-color-text': '#e8e8f2',
    '--nd-color-text-muted': '#9898b8',
    '--nd-color-border': '#2a2a4a',
    '--nd-color-code-bg': '#0f0f1f',
    '--nd-color-accent': '#5b3be0',
    '--nd-color-accent-strong': '#b07cff',
    '--nd-color-accent-soft': 'rgb(91 59 224 / 0.18)',
    '--nd-color-on-accent': '#ffffff',
    '--nd-color-success': '#4ade80',
    '--nd-color-warning': '#fbbf24',
    '--nd-color-danger': '#f87171',
    '--nd-color-info': '#60a5fa',
} as const;

const NDIGO_LIGHT_TOKENS = {
    '--nd-palette-indigo-deep': '#293896',
    '--nd-palette-violet': '#5b3be0',
    '--nd-palette-violet-bright': '#9a38ff',
    '--nd-gradient-brand': 'linear-gradient(135deg, #293896 0%, #5b3be0 45%, #9a38ff 100%)',
    '--nd-color-bg': '#fafaff',
    '--nd-color-surface': '#f2f2fa',
    '--nd-color-surface-raised': '#ffffff',
    '--nd-color-text': '#1a1a2e',
    '--nd-color-text-muted': '#5a5a7a',
    '--nd-color-border': '#e0e0f0',
    '--nd-color-code-bg': '#f0f0f8',
    '--nd-color-accent': '#5b3be0',
    '--nd-color-accent-strong': '#293896',
    '--nd-color-accent-soft': 'rgb(91 59 224 / 0.1)',
    '--nd-color-on-accent': '#ffffff',
    '--nd-color-success': '#15803d',
    '--nd-color-warning': '#92400e',
    '--nd-color-danger': '#b91c1c',
    '--nd-color-info': '#1d4ed8',
} as const;

const SOLARIZED_DARK_TOKENS = {
    '--nd-palette-indigo-deep': '#268bd2',
    '--nd-palette-violet': '#2aa198',
    '--nd-palette-violet-bright': '#268bd2',
    '--nd-gradient-brand': 'linear-gradient(135deg, #268bd2 0%, #2aa198 45%, #9fb800 100%)',
    '--nd-color-bg': '#002b36',
    '--nd-color-surface': '#00212b',
    '--nd-color-surface-raised': '#001a22',
    '--nd-color-text': '#93a1a1',
    '--nd-color-text-muted': '#839496',
    '--nd-color-border': '#1a4a5a',
    '--nd-color-code-bg': '#002028',
    '--nd-color-accent': '#268bd2',
    '--nd-color-accent-strong': '#4aa3df',
    '--nd-color-accent-soft': 'rgb(38 139 210 / 0.18)',
    '--nd-color-on-accent': '#000000',
    '--nd-color-success': '#9fb800',
    '--nd-color-warning': '#d4a800',
    '--nd-color-danger': '#ff5a57',
    '--nd-color-info': '#4aa3df',
} as const;

const SOLARIZED_LIGHT_TOKENS = {
    '--nd-palette-indigo-deep': '#1a5f94',
    '--nd-palette-violet': '#1f6fa8',
    '--nd-palette-violet-bright': '#268bd2',
    '--nd-gradient-brand': 'linear-gradient(135deg, #1a5f94 0%, #1f6fa8 45%, #268bd2 100%)',
    '--nd-color-bg': '#fdf6e3',
    '--nd-color-surface': '#eee8d5',
    '--nd-color-surface-raised': '#f5efdc',
    '--nd-color-text': '#4a5f66',
    '--nd-color-text-muted': '#52656d',
    '--nd-color-border': '#d3cdb7',
    '--nd-color-code-bg': '#f5efdc',
    '--nd-color-accent': '#1f6fa8',
    '--nd-color-accent-strong': '#1a5f94',
    '--nd-color-accent-soft': 'rgb(38 139 210 / 0.1)',
    '--nd-color-on-accent': '#ffffff',
    '--nd-color-success': '#4f6100',
    '--nd-color-warning': '#7a5900',
    '--nd-color-danger': '#b02020',
    '--nd-color-info': '#1a5f94',
} as const;

const HIGH_CONTRAST_DARK_TOKENS = {
    '--nd-palette-indigo-deep': '#60cdff',
    '--nd-palette-violet': '#60cdff',
    '--nd-palette-violet-bright': '#60cdff',
    '--nd-gradient-brand': 'linear-gradient(135deg, #60cdff 0%, #6ccb5f 45%, #f9e000 100%)',
    '--nd-color-bg': '#000000',
    '--nd-color-surface': '#0a0a0a',
    '--nd-color-surface-raised': '#1a1a1a',
    '--nd-color-text': '#ffffff',
    '--nd-color-text-muted': '#c0c0c0',
    '--nd-color-border': '#808080',
    '--nd-color-code-bg': '#0a0a0a',
    '--nd-color-accent': '#60cdff',
    '--nd-color-accent-strong': '#60cdff',
    '--nd-color-accent-soft': 'rgb(96 205 255 / 0.18)',
    '--nd-color-on-accent': '#000000',
    '--nd-color-success': '#6ccb5f',
    '--nd-color-warning': '#f9e000',
    '--nd-color-danger': '#ff6b6b',
    '--nd-color-info': '#60cdff',
} as const;

const HIGH_CONTRAST_LIGHT_TOKENS = {
    '--nd-palette-indigo-deep': '#0067c0',
    '--nd-palette-violet': '#0067c0',
    '--nd-palette-violet-bright': '#0067c0',
    '--nd-gradient-brand': 'linear-gradient(135deg, #0067c0 0%, #0f7b0f 45%, #7a5900 100%)',
    '--nd-color-bg': '#ffffff',
    '--nd-color-surface': '#f3f3f3',
    '--nd-color-surface-raised': '#ffffff',
    '--nd-color-text': '#000000',
    '--nd-color-text-muted': '#333333',
    '--nd-color-border': '#808080',
    '--nd-color-code-bg': '#f3f3f3',
    '--nd-color-accent': '#0067c0',
    '--nd-color-accent-strong': '#0067c0',
    '--nd-color-accent-soft': 'rgb(0 103 192 / 0.1)',
    '--nd-color-on-accent': '#ffffff',
    '--nd-color-success': '#0f7b0f',
    '--nd-color-warning': '#7a5900',
    '--nd-color-danger': '#c50f1f',
    '--nd-color-info': '#0067c0',
} as const;

export const NDIGO_DARK_THEME: Theme = {
    name: 'ndigo-dark',
    colorScheme: 'dark',
    tokens: NDIGO_DARK_TOKENS,
    description: 'Ndigo dark theme (default).',
};

export const NDIGO_LIGHT_THEME: Theme = {
    name: 'ndigo-light',
    colorScheme: 'light',
    tokens: NDIGO_LIGHT_TOKENS,
    description: 'Ndigo light theme.',
};

export const SOLARIZED_DARK_THEME: Theme = {
    name: 'solarized-dark',
    colorScheme: 'dark',
    tokens: SOLARIZED_DARK_TOKENS,
    description: 'Solarized dark theme.',
};

export const SOLARIZED_LIGHT_THEME: Theme = {
    name: 'solarized-light',
    colorScheme: 'light',
    tokens: SOLARIZED_LIGHT_TOKENS,
    description: 'Solarized light theme.',
};

export const HIGH_CONTRAST_DARK_THEME: Theme = {
    name: 'high-contrast-dark',
    colorScheme: 'dark',
    tokens: HIGH_CONTRAST_DARK_TOKENS,
    description: 'High contrast dark theme.',
};

export const HIGH_CONTRAST_LIGHT_THEME: Theme = {
    name: 'high-contrast-light',
    colorScheme: 'light',
    tokens: HIGH_CONTRAST_LIGHT_TOKENS,
    description: 'High contrast light theme.',
};

export const COMMON_THEMES: readonly Theme[] = [
    NDIGO_DARK_THEME,
    NDIGO_LIGHT_THEME,
    SOLARIZED_DARK_THEME,
    SOLARIZED_LIGHT_THEME,
    HIGH_CONTRAST_DARK_THEME,
    HIGH_CONTRAST_LIGHT_THEME,
];

/**
 * Finds a built-in theme by name.
 * @param name - Theme name.
 * @returns The theme, or `undefined` when not a built-in.
 */
export function getCommonTheme(name: string): Theme | undefined {
    return COMMON_THEMES.find((theme) => theme.name === name);
}
