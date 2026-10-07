/**
 * Client entry: imports the stylesheet and the `kanban-board` element (whose
 * `@TagMapping` decorator registers it), upgrading the shell's inert markup.
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import './styles.css';
import { KanbanBoard } from './kanban-board';

// The element is registered by the decorator on import; keep the reference so
// bundlers cannot tree-shake the side effect away.
void KanbanBoard;
