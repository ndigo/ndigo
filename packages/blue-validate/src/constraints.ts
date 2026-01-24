/**
 * @author Jeff Rose
 */

import standardConstraints from './standard-constraints';

// TODO Now what do we do with this?
//config			  = module.config(),
//customConstraints = config.constraints,

const customConstraints = {},
    constants = Object.assign({}, standardConstraints, customConstraints);

export default constants;
