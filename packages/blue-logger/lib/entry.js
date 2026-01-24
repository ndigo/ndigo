/**
 * @author Jeff Rose
 */
/**
 * @function module:logger.newEntry
 * @param {external:string} category
 * @param {module:logger.Level} level
 * @param {external:Array<module:logger.loggable>} message
 * @param {external:string} [source]
 */
export const newEntry = (category, level, message, source) => ({
    message: message,
    error: message[0] instanceof Error,
    level: level,
    category: category,
    source: source,
    timestamp: Date.now(),
});
/**
 * @typedef {module:core.serializable | external:Error} module:logger.loggable
 */
/**
 * @typedef {external:Object} module:logger.Entry
 * @property {external:string} category
 * @property {external:boolean} [error]
 * @property {module:logger.Level} level
 * @property {external:Array<module:logger.loggable>} message
 * @property {external:string} [source]
 * @property {external:number} timestamp
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFnQkg7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxLQUFZLEVBQUUsT0FBbUIsRUFBRSxNQUFlLEVBQVMsRUFBRSxDQUFDLENBQUM7SUFDdEcsT0FBTyxFQUFFLE9BQU87SUFDaEIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLO0lBQ2xDLEtBQUssRUFBRSxLQUFLO0lBQ1osUUFBUSxFQUFFLFFBQVE7SUFDbEIsTUFBTSxFQUFFLE1BQU07SUFDZCxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtDQUN4QixDQUFDLENBQUM7QUFFSDs7R0FFRztBQUVIOzs7Ozs7OztHQVFHIn0=