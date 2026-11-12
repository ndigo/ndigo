/**
 * UI/Date Picker — popup calendar built on the Zag.js date-picker machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface DatePickerArgs {
    /** Initial ISO date (`YYYY-MM-DD`). */
    value: string;
    name: string;
    /** Earliest selectable ISO date. */
    min: string;
    /** Latest selectable ISO date. */
    max: string;
    locale: string;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    invalid: boolean;
}

const meta = {
    title: 'UI/Date Picker',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/date-picker') } },
    },
    argTypes: {
        value: { control: 'text', description: 'ISO date (`YYYY-MM-DD`).' },
        name: { control: 'text' },
        min: { control: 'text' },
        max: { control: 'text' },
        locale: { control: 'text' },
        disabled: { control: 'boolean' },
        readonly: { control: 'boolean' },
        required: { control: 'boolean' },
        invalid: { control: 'boolean' },
    },
    args: {
        value: '2026-11-09',
        name: 'start',
        min: '',
        max: '',
        locale: 'en-US',
        disabled: false,
        readonly: false,
        required: false,
        invalid: false,
    },
    render: ({ value, name, min, max, locale, disabled, readonly, required, invalid }) => html`
        <nd-date-picker
            value=${value}
            name=${name}
            locale=${locale}
            min=${min === '' ? nothing : min}
            max=${max === '' ? nothing : max}
            style="max-inline-size: 20rem"
            ?disabled=${disabled}
            ?readonly=${readonly}
            ?required=${required}
            ?invalid=${invalid}
        >
            <label data-part="label">Start date</label>
            <div data-part="control">
                <input data-part="input" placeholder="Pick a date" />
                <button data-part="trigger" type="button" aria-label="Open calendar">⌄</button>
                <button data-part="clear-trigger" type="button" aria-label="Clear date">×</button>
            </div>
            <div data-part="positioner">
                <div data-part="content">
                    <div data-part="view-control">
                        <button data-part="prev-trigger" type="button" aria-label="Previous month">‹</button>
                        <span data-part="view-label"></span>
                        <button data-part="next-trigger" type="button" aria-label="Next month">›</button>
                    </div>
                </div>
            </div>
        </nd-date-picker>
    `,
} satisfies Meta<DatePickerArgs>;

export default meta;
type Story = StoryObj<DatePickerArgs>;

/** A preselected date with the calendar closed. */
export const Default: Story = {};

/** The calendar opened through the element's `show()` method. */
export const Open: Story = {
    play: ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement & { show(): void }>('nd-date-picker')?.show();
    },
};

/** A bounded range: only November 2026 is selectable. */
export const Bounded: Story = {
    args: { value: '2026-11-15', min: '2026-11-01', max: '2026-11-30' },
};
