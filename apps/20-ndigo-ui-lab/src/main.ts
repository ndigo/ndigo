/**
 * Lab bootstrap: load the registry-installed theme and elements, then wire the
 * token readout and the menu selection status.
 */
import './ui/nd-dialog/nd-dialog';
import './ui/nd-drawer/nd-drawer';
import './ui/nd-menu/nd-menu';
import './ui/nd-popover/nd-popover';
import './ui/nd-tooltip/nd-tooltip';
import './ui/nd-tabs/nd-tabs';
import './ui/nd-accordion/nd-accordion';
import type { NdToast } from './ui/nd-toast/nd-toast';
import './ui/nd-toast/nd-toast';
import './ui/nd-slider/nd-slider';
import './ui/nd-switch/nd-switch';
import './ui/nd-select/nd-select';
import './ui/nd-combobox/nd-combobox';
import './ui/nd-date-picker/nd-date-picker';
import './ui/nd-scroll-area/nd-scroll-area';
import './ui/nd-navigation-menu/nd-navigation-menu';
import { initCommandPalette } from './components/command/command';
import { TOKENS } from '@ndigo/ui';

const tokenCount = document.querySelector('#token-count');
if (tokenCount !== null) tokenCount.textContent = String(TOKENS.length);

const menu = document.querySelector('nd-menu');
const status = document.querySelector('#menu-status');
menu?.addEventListener('nd-select', (event) => {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    if (status !== null) status.textContent = `Selected: ${detail.value}`;
});

const toast = document.querySelector<NdToast>('nd-toast');
document.querySelector('#toast-trigger')?.addEventListener('click', () => toast?.show());

const command = initCommandPalette(document);
const commandStatus = document.querySelector('#command-status');
command?.root.addEventListener('nd-command', (event) => {
    const detail = (event as CustomEvent<{ label: string }>).detail;
    if (commandStatus !== null) commandStatus.textContent = `Selected: ${detail.label}`;
});

const datePicker = document.querySelector('nd-date-picker');
const dateStatus = document.querySelector('#date-status');
datePicker?.addEventListener('nd-value-change', (event) => {
    const detail = (event as CustomEvent<{ valueAsString: string[] }>).detail;
    if (dateStatus !== null) {
        dateStatus.textContent = detail.valueAsString[0] ? `Selected: ${detail.valueAsString[0]}` : 'No date selected';
    }
});
