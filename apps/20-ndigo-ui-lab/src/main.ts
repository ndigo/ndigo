/**
 * Lab bootstrap: load the registry-installed theme and elements, then wire the
 * token readout and the menu selection status.
 */
import './ui/nd-dialog/nd-dialog';
import './ui/nd-menu/nd-menu';
import { TOKENS } from '@ndigo/ui';

const tokenCount = document.querySelector('#token-count');
if (tokenCount !== null) tokenCount.textContent = String(TOKENS.length);

const menu = document.querySelector('nd-menu');
const status = document.querySelector('#menu-status');
menu?.addEventListener('nd-select', (event) => {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    if (status !== null) status.textContent = `Selected: ${detail.value}`;
});
