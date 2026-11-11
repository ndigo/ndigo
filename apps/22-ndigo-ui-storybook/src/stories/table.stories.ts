/**
 * Storybook stories for the Ndigo UI table component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Table',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-table-wrap">
            <table class="nd-table">
                <caption class="nd-table__caption">
                    Open invoices
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Invoice</th>
                        <th scope="col">Customer</th>
                        <th scope="col" aria-sort="ascending">
                            <button class="nd-table__sort" type="button">
                                Amount
                                <span class="nd-table__sort-icon" aria-hidden="true">↑</span>
                            </button>
                        </th>
                        <th scope="col" data-numeric>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>INV-001</td>
                        <td>Acme</td>
                        <td data-numeric>$1,200.00</td>
                        <td data-numeric>$1,200.00</td>
                    </tr>
                    <tr>
                        <td>INV-002</td>
                        <td>Globex</td>
                        <td data-numeric>$840.00</td>
                        <td data-numeric>$840.00</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Total</td>
                        <td data-numeric>$2,040.00</td>
                    </tr>
                </tfoot>
            </table>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
