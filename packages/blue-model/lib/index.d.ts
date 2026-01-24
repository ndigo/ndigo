/**
 * @author Jeff Rose
 * @module model
 * @requires core
 * @requires util
 * @see {@link http://objectmodel.js.org/}
 */
import '../node_modules/objectmodel/src/devtool-formatter';
/**
 * @external objectmodel
 * @see {@link http://objectmodel.js.org/}
 */
/**
 * @class module:model.Model
 * @param {*} def
 * @param {*} params
 */
/**
 * @member {external:Array<external:Function>} module:model.Model#assertions
 */
/**
 * @member {*} module:model.Model#definition
 */
/**
 * @member {external:string} module:model.Model#name
 */
/**
 * @function module:model.Model#as
 * @param {external:string} newName
 */
/**
 * @function module:model.Model#assert
 * @param {external:Function} assertion
 * @param {*} [description]
 */
/**
 * @function module:model.Model#extend
 * @param {...*} modelsOrDefinitions
 */
/**
 * @class module:model.ArrayModel
 * @extends module:model.Model
 */
/**
 * @class module:model.BasicModel
 * @extends module:model.Model
 */
/**
 * @class module:model.FunctionModel
 * @extends module:model.Model
 */
/**
 * @class module:model.MapModel
 * @extends module:model.Model
 */
/**
 * @class module:model.ObjectModel
 * @extends module:model.Model
 */
/**
 * @class module:model.SetModel
 * @extends module:model.Model
 */
/**
 * @const module:model.Any
 */
export * from '../node_modules/objectmodel/src/index';
export * from './basic';
export * from './event';
//# sourceMappingURL=index.d.ts.map