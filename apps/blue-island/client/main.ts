import { AbstractWebComponent } from '@blue/view-webcomponent';
import { hydrateIslands } from '@blue/view-webcomponent';
import { TagMapping } from '@blue/view-webcomponent';

/**
 * `todo-app` — the island's client half. The server renders this element with
 * `data-blue-model="…"`; `hydrateIslands()` constructs it, restores `.model`,
 * and its `render()` draws the todo list interactively.
 */

type TodoItem = { text: string; done: boolean };
type TodoModel = { items: TodoItem[]; filter: string };

@TagMapping('todo-app')
class TodoIsland extends AbstractWebComponent {
    #model: TodoModel = { items: [], filter: 'all' };

    set model(model: TodoModel) {
        this.#model = model;
        this.render();
    }

    get model(): TodoModel {
        return this.#model;
    }

    render(): void {
        this.replaceChildren();
        const list = document.createElement('ul');
        for (const item of this.#model.items) {
            const li = document.createElement('li');
            li.textContent = `${item.done ? '✅' : '⬜'} ${item.text}`;
            list.append(li);
        }
        this.append(list);
        const hint = document.createElement('p');
        hint.style.fontSize = '0.85rem';
        hint.style.color = '#666';
        hint.textContent = `[hydrated on client] ${this.#model.items.length} item(s), filter: ${this.#model.filter}`;
        this.append(hint);
    }
}

// The class is registered via @TagMapping side-effect.
void TodoIsland;

// Upgrade any server-rendered islands on the page.
hydrateIslands();