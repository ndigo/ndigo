import '@ndigo/ui/tokens.css';
import '@ndigo/ui/theme.css';

// Register every registry component and its stylesheet so stories can use them
// without per-story imports. The glob is eager so custom elements are defined
// before any story renders.
import.meta.glob('../../../packages/ndigo-ui/registry/ui/**/*.css', { eager: true });
import.meta.glob('../../../packages/ndigo-ui/registry/ui/**/*.ts', { eager: true });
import.meta.glob('../../../packages/ndigo-ui/registry/blocks/**/*.css', { eager: true });
import.meta.glob('../../../packages/ndigo-ui/registry/blocks/**/*.ts', { eager: true });

export const parameters = {
    controls: { expanded: true },
    a11y: { test: 'todo' },
};
