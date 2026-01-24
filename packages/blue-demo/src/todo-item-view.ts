const templateTodoItem = document.createElement( 'template' );
templateTodoItem.innerHTML = `
    <li class="item">
        <div class="view">
            <input class="toggle" type="checkbox">
            <label></label>
            <button class="destroy"></button>
        </div>
    </li>
`;

export default class TodoItem extends HTMLElement {
    #checked;
    #index;
    #text;

    $checkbox;
    $item;
    $removeButton;
    $text;

    constructor() {
        super();
        // Do not use shadow DOM to avoid problems when testing with selenium
        // this._root = this.attachShadow({ 'mode': 'open' });
        this.#checked = false;
        this.#text = '';
    }

    connectedCallback() {
        this.appendChild( templateTodoItem.content.cloneNode( true ) );
        this.$item = this.querySelector( '.item' );
        this.$removeButton = this.querySelector( '.destroy' );
        this.$text = this.querySelector( 'label' );
        this.$checkbox = this.querySelector( 'input' );
        this.$removeButton.addEventListener( 'click', ( e ) => {
            e.preventDefault();
            this.dispatchEvent( new CustomEvent( 'onRemove', { detail: this.index } ) );
        } );
        this.$checkbox.addEventListener( 'click', ( e ) => {
            e.preventDefault();
            this.dispatchEvent( new CustomEvent( 'onToggle', { detail: this.index } ) );
        } );
        this._render();
    }

    disconnectedCallback() { }

    static get observedAttributes() {
        return [ 'text' ];
    }
    attributeChangedCallback( name, oldValue, newValue ) {
        this.#text = newValue;
    }

    set index( value ) {
        this.#index = value;
    }

    get index() {
        return this.#index;
    }

    set checked( value ) {
        this.#checked = Boolean( value );
    }

    get checked() {
        return this.hasAttribute( 'checked' );
    }

    _render() {
        if( !this.$item ) return;
        this.$text.textContent = this.#text;
        if( this.#checked ) {
            this.$item.classList.add( 'completed' );
            this.$checkbox.setAttribute( 'checked', '' );
        } else {
            this.$item.classList.remove( 'completed' );
            this.$checkbox.removeAttribute( 'checked' );
        }

    }
}

window.customElements.define( 'todo-item', TodoItem );
