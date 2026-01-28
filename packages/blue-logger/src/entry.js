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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbnRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQWdCSDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxDQUFDLFFBQWdCLEVBQUUsS0FBWSxFQUFFLE9BQW1CLEVBQUUsTUFBZSxFQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3RHLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSztJQUNsQyxLQUFLLEVBQUUsS0FBSztJQUNaLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7Q0FDeEIsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFFSDs7Ozs7Ozs7R0FRRyJ9