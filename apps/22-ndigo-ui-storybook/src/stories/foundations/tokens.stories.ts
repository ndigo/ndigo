/**
 * Every design token, grouped, with the value resolved in the active theme.
 *
 * Values are read from the live stylesheet rather than duplicated, so the page
 * follows the Theme toolbar switch.
 */
import type { TokenDefinition, TokenGroup, TokenName } from '@ndigo/ui';
import { TOKEN_GROUPS, TOKENS } from '@ndigo/ui';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const GROUP_LABELS: Record<TokenGroup, string> = {
    palette: 'Palette',
    color: 'Semantic color',
    typography: 'Typography',
    space: 'Space',
    radius: 'Radius',
    elevation: 'Elevation',
    motion: 'Motion',
    z: 'Layering',
    focus: 'Focus',
};

const COLOR_GROUPS = new Set<TokenGroup>(['palette', 'color']);

const styles = html`<style>
    .nd-token-page {
        display: grid;
        gap: 2.5rem;
        max-inline-size: 72rem;
    }
    .nd-token-group h2 {
        margin-block-end: 0.75rem;
        font-size: 1rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--nd-color-text-muted);
    }
    .nd-token-swatch {
        display: inline-block;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border: 1px solid var(--nd-color-border);
        border-radius: var(--nd-radius-sm);
        vertical-align: middle;
    }
    .nd-token-value {
        font-family: var(--nd-font-mono);
        font-size: 0.8125rem;
        color: var(--nd-color-text-muted);
        white-space: pre-wrap;
    }
</style>`;

function tokenValue(name: TokenName): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function tokenRow(token: TokenDefinition) {
    return html`<tr>
        <td>
            <code>${token.name}</code>
        </td>
        <td>
            ${
                COLOR_GROUPS.has(token.group)
                    ? html`<span class="nd-token-swatch" style="background: var(${token.name})"></span>`
                    : null
            }
        </td>
        <td class="nd-token-value">${tokenValue(token.name)}</td>
        <td>${token.description}</td>
    </tr>`;
}

function groupTable(group: TokenGroup) {
    return html`<section class="nd-token-group">
        <h2>${GROUP_LABELS[group]}</h2>
        <div class="nd-table-wrap">
            <table class="nd-table">
                <thead>
                    <tr>
                        <th scope="col">Token</th>
                        <th scope="col">Swatch</th>
                        <th scope="col">Value</th>
                        <th scope="col">Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${TOKENS.filter((token) => token.group === group).map(tokenRow)}
                </tbody>
            </table>
        </div>
    </section>`;
}

const meta: Meta = {
    title: 'Foundations/Tokens',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'The design-token contract. Every value below is read from `tokens/ndigo-tokens.css` in the theme selected in the toolbar, so switching Dark/Light re-renders the resolved values.',
            },
        },
    },
};

export default meta;
type Story = StoryObj;

/** All token groups, in contract order. */
export const Default: Story = {
    render: () =>
        html`${styles}
            <div class="nd-token-page">${TOKEN_GROUPS.map(groupTable)}</div>`,
};

/** The color-bearing groups only, as a swatch wall. */
export const Palette: Story = {
    render: () =>
        html`${styles}
            <div class="nd-token-page">
                ${TOKEN_GROUPS.filter((group) => COLOR_GROUPS.has(group)).map(
                    (group) =>
                        html`<section class="nd-token-group">
                            <h2>${GROUP_LABELS[group]}</h2>
                            <div
                                style="display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
                            >
                                ${TOKENS.filter((token) => token.group === group).map(
                                    (token) =>
                                        html`<figure style="margin: 0">
                                            <span
                                                class="nd-token-swatch"
                                                style="inline-size: 100%; block-size: 3.5rem; border-radius: var(--nd-radius-md); background: var(${token.name})"
                                            ></span>
                                            <figcaption class="nd-token-value" style="margin-block-start: 0.375rem">
                                                ${token.name}
                                            </figcaption>
                                        </figure>`
                                )}
                            </div>
                        </section>`
                )}
            </div>`,
};
