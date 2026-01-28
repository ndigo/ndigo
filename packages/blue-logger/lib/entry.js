/**
 * @author Jeff Rose
 */
/**
 * @param {string} category
 * @param {module:logger.Level} level
 * @param {Array<module:logger.loggable>} message
 * @param {string} [source]
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
 * @typedef {Object} module:logger.Entry
 * @property {string} category
 * @property {boolean} [error]
 * @property {module:logger.Level} level
 * @property {Array<module:logger.loggable>} message
 * @property {string} [source]
 * @property {number} timestamp
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFnQkg7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEtBQVksRUFBRSxPQUFtQixFQUFFLE1BQWUsRUFBUyxFQUFFLENBQUMsQ0FBQztJQUN0RyxPQUFPLEVBQUUsT0FBTztJQUNoQixLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUs7SUFDbEMsS0FBSyxFQUFFLEtBQUs7SUFDWixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsTUFBTTtJQUNkLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO0NBQ3hCLENBQUMsQ0FBQztBQUVIOztHQUVHO0FBRUg7Ozs7Ozs7O0dBUUcifQ==