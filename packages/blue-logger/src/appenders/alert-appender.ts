/**
 * @author Jeff Rose
 */

import { AbstractAppender } from '../appender';
import { Entry } from '../entry';

export class AlertAppender extends AbstractAppender {
    append(entry: Entry): void {
        alert(this.layout.format(entry));
    }
}
