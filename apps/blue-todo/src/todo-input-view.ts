/**
 * @author Jeff Rose
 */

import { AbstractWebComponent } from '@blue/view-webcomponent';

export default class TodoInput extends AbstractWebComponent {
    private $form!: HTMLFormElement;
    private $input!: HTMLInputElement;

    handleConnect(): void {
        this.$form = this.create('form', { id: 'new-todo-form' }) as HTMLFormElement;
        this.$input = this.create('input', { 
            type: 'text', 
            className: 'new-todo', 
            placeholder: 'What needs to be done?',
            autofocus: true 
        }) as HTMLInputElement;

        this.$form.appendChild(this.$input);
        this.appendChild(this.$form);

        this.bindEvents({
            'submit #new-todo-form': 'handleSubmit'
        });
    }

    private handleSubmit(e: Event): void {
        e.preventDefault();
        if (!this.$input.value) return;
        this.emit('onSubmit', this.$input.value);
        this.$input.value = '';
    }

    render(): void {
        // No dynamic rendering needed for the input shell
    }
}

window.customElements.define('todo-input', TodoInput);
