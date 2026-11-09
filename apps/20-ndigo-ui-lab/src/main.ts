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
import './ui/nd-tags-input/nd-tags-input';
import './ui/nd-file-upload/nd-file-upload';
import { initCommandPalette } from './components/command/command';
import { initDataTable } from './components/data-table/data-table';
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

const tags = document.querySelector('nd-tags-input');
const tagStatus = document.querySelector('#tags-status');
tags?.addEventListener('nd-value-change', (event) => {
    const detail = (event as CustomEvent<{ value: string[] }>).detail;
    if (tagStatus !== null) tagStatus.textContent = `${detail.value.length} tags`;
});

const files = document.querySelector('nd-file-upload');
const filesStatus = document.querySelector('#files-status');
files?.addEventListener('nd-file-change', (event) => {
    const detail = (event as CustomEvent<{ acceptedFiles: File[] }>).detail;
    if (filesStatus !== null) {
        filesStatus.textContent = detail.acceptedFiles.length
            ? detail.acceptedFiles.map((file) => file.name).join(', ')
            : 'No files';
    }
});

initDataTable(document);

const dataTable = document.querySelector('[data-data-table]');
const dataTableSelection = document.querySelector('#data-table-selection');
dataTable?.addEventListener('nd-selection-change', (event) => {
    const detail = (event as CustomEvent<{ ids: string[] }>).detail;
    if (dataTableSelection !== null) {
        dataTableSelection.textContent = detail.ids.length ? `Selected: ${detail.ids.join(', ')}` : 'No rows selected';
    }
});
