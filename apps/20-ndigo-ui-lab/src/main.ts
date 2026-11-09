/**
 * Lab bootstrap: load the registry-installed theme and elements, then wire the
 * token readout and the menu selection status.
 *
 * The element and stylesheet lists are globbed from the installed trees, so
 * adding a registry item does not require editing this file (or index.html).
 */
import '../styles/ndigo-tokens.css';
import '../styles/ndigo-base.css';
import './styles/lab.css';
import type { NdToast } from './ui/nd-toast/nd-toast';
import { initCommandPalette } from './components/command/command';
import { initDataTable } from './components/data-table/data-table';
import { initCodeBlocks } from './components/code-block/code-block';
import { TOKENS } from '@ndigo/ui';

const _uiStyles = import.meta.glob('./ui/**/*.css', { eager: true });
const _uiModules = import.meta.glob('./ui/**/*.ts', { eager: true });
const _blockStyles = import.meta.glob('./components/**/*.css', { eager: true });

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
initCodeBlocks(document);

const dataTable = document.querySelector('[data-data-table]');
const dataTableSelection = document.querySelector('#data-table-selection');
dataTable?.addEventListener('nd-selection-change', (event) => {
    const detail = (event as CustomEvent<{ ids: string[] }>).detail;
    if (dataTableSelection !== null) {
        dataTableSelection.textContent = detail.ids.length ? `Selected: ${detail.ids.join(', ')}` : 'No rows selected';
    }
});
