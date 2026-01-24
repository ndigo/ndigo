/**
 * @author Jeff Rose
 */
import standardTypes from './standard-types';

// TODO how do we get this?
//config      = module.config(),
//customTypes = config.types,

const customTypes = {},
    types = Object.assign({}, standardTypes, customTypes);

export default types;
