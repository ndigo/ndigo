/**
 * @author Jeff Rose
 */

import has from '@blue/has';
import fill from './fill';

let module: Promise<any>;

if (has.xmlhttprequest) {
    fill(['xmlhttprequest_withcredentials', 'file', 'filelist', 'filereader'], () => (module = import('mOxie')));
}

export default module || Promise.resolve();
