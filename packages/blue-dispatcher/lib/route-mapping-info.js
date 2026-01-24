/**
 * @author Jeff Rose
 */
import { GlobPathMatcher, likePathMatcher } from '@blue/core';
import { AbstractNameValueExpression, AbstractRouteCondition, RouteConditionHolder, likeRouteCondition, } from './route-condition';
const { defineProperty } = Reflect, { isArray } = Array, preprendPeriod = (value) => (value[0] === '.' ? value : `.${value}`), prependSlash = (value) => (value[0] === '/' ? value : `/${value}`), separator = '';
/*
export class AccessExpression extends AbstractNameValueExpression<boolean> {
    isCaseSensitiveName: boolean;

    matchName( route: Route ): boolean {
        return 'private' in route && route.private;
    }

    matchValue( route: Route ): boolean {
        return this.value === route.private;
    }

    parseValue( valueExpression: string ): boolean {
        throw new Error( "Method not implemented." );
    }
}
*/
/**
 * Parses and matches a single param expression to a route.
 * @class module:dispatcher.ParamExpression
 * @extends module:dispatcher.AbstractNameValueExpression<external:string>
 * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
 */
export class ParamExpression extends AbstractNameValueExpression {
    namesToMatch;
    get isCaseSensitiveName() {
        return true;
    }
    constructor(expression) {
        super(expression);
        defineProperty(this, 'namesToMatch', {
            value: new Set(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.namesToMatch.add(this.name);
    }
    matchName(route) {
        for (const name of this.namesToMatch) {
            if ('data' in route && name in route.data) {
                return true;
            }
        }
        return 'data' in route && this.name in route.data;
    }
    matchValue(route) {
        return this.value === route.data[this.name];
    }
    parseValue(valueExpression) {
        return valueExpression;
    }
}
/**
 * A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in {@linkcode module:dispatcher.RouteMapping|RouteMapping}.
 * @class module:dispatcher.ParamsRouteCondition
 * @extends module:dispatcher.AbstractRouteCondition
 */
export class ParamsRouteCondition extends AbstractRouteCondition {
    expressions;
    get content() {
        return Array.from(this.expressions);
    }
    get infix() {
        return ' && ';
    }
    constructor(paramOrConditions, ...params) {
        super();
        defineProperty(this, 'expressions', {
            value: typeof paramOrConditions === 'string'
                ? this._parseExpressions([paramOrConditions].concat(params))
                : new Set(paramOrConditions),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    /**
     * Returns a new instance with the union of the param expressions from _this_ and the value provided.
     */
    merge(value) {
        const expressions = new Set(this.expressions);
        for (const expression of value.expressions) {
            expressions.add(expression);
        }
        return new ParamsRouteCondition(expressions);
    }
    /**
     * Returns `this` instance if the route matches all param expressions or `null` otherwise.
     */
    getMatchingCondition(route) {
        for (const expression of this.expressions) {
            if (!expression.match(route)) {
                return null;
            }
        }
        return this;
    }
    /**
     * Compare to another condition based on parameter expressions. A condition is considered to be a more specific match, if it has:
     * - A greater number of expressions.
     * - A greater number of non-negated expressions with a concrete value.
     * @function module:dispatcher.ParamsRouteCondition#compareTo
     * @param {module:dispatcher.ParamsRouteCondition} value
     * @returns {external:number}
     */
    compareTo(value, route) {
        const result = value.expressions.size - this.expressions.size;
        if (result !== 0) {
            return result;
        }
        return this._getValueMatchCount(value.expressions) - this._getValueMatchCount(this.expressions);
    }
    _getValueMatchCount(expressions) {
        let count = 0;
        for (const expression of expressions) {
            if (expression.value !== void 0 && !expression.isNegated) {
                count++;
            }
        }
        return count;
    }
    _parseExpressions(params) {
        const expressions = new Set();
        params.forEach((param) => expressions.add(new ParamExpression(param)));
        return expressions;
    }
}
/**
 * Creates a new instance with the given route patterns. Each pattern that is not empty and does not start with "/" is prepended with "/".
 * @class module:dispatcher.PatternsRouteCondition
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
 */
/**
 * @class module:dispatcher.PatternsRouteCondition
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {external:Array<external:string>} patterns the route patterns to use; if 0, the condition will match to every route.
 * @param {module:core.PathMatcher} pathMatcher
 * @param {external:boolean} useTrailingSlashMatch whether to match irrespective of a trailing slash
 * @param {external:Array<external:string>} [fileExtensions] a list of file extensions to consider for path matching
 */
export class PatternsRouteCondition extends AbstractRouteCondition {
    pathMatcher;
    fileExtensions;
    patterns;
    useTrailingSlashMatch;
    get content() {
        return Array.from(this.patterns);
    }
    get infix() {
        return ' || ';
    }
    constructor(patterns = '', pathMatcherOrRouteCondition, useTrailingSlashMatch, fileExtensions, ...morePatterns) {
        super();
        // TODO Clean up this logic
        if (typeof patterns === 'string') {
            patterns = [patterns];
            if (typeof pathMatcherOrRouteCondition === 'string') {
                patterns.push(pathMatcherOrRouteCondition);
                pathMatcherOrRouteCondition = new GlobPathMatcher();
            }
            if (typeof useTrailingSlashMatch === 'string') {
                patterns.push(useTrailingSlashMatch);
                useTrailingSlashMatch = true;
            }
            if (typeof fileExtensions === 'string') {
                patterns.push(fileExtensions);
                fileExtensions = [];
            }
            if (isArray(morePatterns) && morePatterns.length) {
                patterns = patterns.concat(morePatterns);
            }
        }
        if (isArray(patterns)) {
            const discretePatterns = new Set();
            patterns.forEach(function (pattern) {
                if (pattern.length > 0) {
                    pattern = prependSlash(pattern);
                }
                discretePatterns.add(pattern);
            });
            defineProperty(this, 'patterns', {
                value: discretePatterns,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        else {
            defineProperty(this, 'patterns', {
                value: patterns,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        if (likePathMatcher(pathMatcherOrRouteCondition)) {
            defineProperty(this, 'pathMatcher', {
                value: pathMatcherOrRouteCondition,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'useTrailingSlashMatch', {
                value: useTrailingSlashMatch,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }
        else if (likeRouteCondition(pathMatcherOrRouteCondition)) {
            const { pathMatcher } = pathMatcherOrRouteCondition;
            useTrailingSlashMatch = pathMatcherOrRouteCondition.useTrailingSlashMatch;
            fileExtensions = pathMatcherOrRouteCondition.fileExtensions;
            defineProperty(this, 'pathMatcher', {
                value: pathMatcher,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'useTrailingSlashMatch', {
                value: useTrailingSlashMatch,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }
        else {
            defineProperty(this, 'pathMatcher', {
                value: new GlobPathMatcher(),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'useTrailingSlashMatch', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }
        defineProperty(this, 'fileExtensions', {
            value: isArray(fileExtensions) && fileExtensions.length ? fileExtensions.map(preprendPeriod) : [],
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    merge(value) {
        const result = new Set(), thisSize = this.patterns.size, valueSize = value.patterns.size;
        if (thisSize > 0 && valueSize > 0) {
            for (const pattern1 of this.patterns) {
                for (const pattern2 of value.patterns) {
                    result.add(this.pathMatcher.merge(pattern1, pattern2));
                }
            }
        }
        else if (thisSize > 0) {
            for (const pattern of this.patterns) {
                result.add(pattern);
            }
        }
        else if (valueSize > 0) {
            for (const pattern of value.patterns) {
                result.add(pattern);
            }
        }
        else {
            result.add('');
        }
        return new PatternsRouteCondition(result, this);
    }
    getMatchingCondition(route) {
        if (this.patterns.size === 0) {
            return this;
        }
        const matches = this.getMatchingPatterns(route.path);
        return matches.length ? new PatternsRouteCondition(new Set(matches), this) : null;
    }
    getMatchingPatterns(path) {
        const matches = [];
        this.patterns.forEach((pattern) => {
            const match = this._getMatchingPattern(pattern, path);
            if (match) {
                matches.push(match);
            }
        }, this);
        if (matches.length > 1) {
            // TODO Use pattern comparator
            matches.sort();
        }
        return matches;
    }
    compareTo(value, route) {
        const path = route.path, patternComparator = this.pathMatcher.getPatternComparator(path), iterator1 = this.patterns.values(), iterator2 = value.patterns.values();
        for (let item1, item2; !(item1 = iterator1.next()).done && !(item2 = iterator2.next()).done;) {
            const result = patternComparator.compare(item1, item2);
            if (result !== 0) {
                return result;
            }
        }
        if (!iterator1.next().done) {
            return -1;
        }
        else if (!iterator2.next().done) {
            return 1;
        }
        else {
            return 0;
        }
    }
    _getMatchingPattern(pattern, path) {
        if (pattern === path) {
            return pattern;
        }
        const { pathMatcher, useTrailingSlashMatch } = this;
        if (pathMatcher.match(pattern, path)) {
            return pattern;
        }
        if (useTrailingSlashMatch) {
            const patternSlash = `${pattern}/`;
            if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                return patternSlash;
            }
        }
        return null;
    }
}
export class RouteMappingInfo {
    name;
    patternsCondition;
    paramsCondition;
    customConditionHolder;
    constructor(name = null, patterns = new PatternsRouteCondition(), params = new ParamsRouteCondition(), custom = null) {
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'patternsCondition', {
            value: patterns,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'paramsCondition', {
            value: params,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'customConditionHolder', {
            value: new RouteConditionHolder(custom),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    merge(value) {
        const name = this._mergeNames(value), params = this.paramsCondition.merge(value.paramsCondition), patterns = this.patternsCondition.merge(value.patternsCondition), custom = this.customConditionHolder.merge(value.customConditionHolder);
        return new RouteMappingInfo(name, patterns, params, custom.condition);
    }
    getMatchingCondition(route) {
        console.log('RouteMappingInfo::getMatchingCondition', this.name, route);
        const params = this.paramsCondition.getMatchingCondition(route);
        if (!params) {
            return null;
        }
        const patterns = this.patternsCondition.getMatchingCondition(route);
        if (!patterns) {
            return null;
        }
        const custom = this.customConditionHolder.getMatchingCondition(route);
        if (!custom) {
            return null;
        }
        return new RouteMappingInfo(this.name, patterns, params, custom.condition);
    }
    compareTo(value, route) {
        let result;
        result = this.paramsCondition.compareTo(value.paramsCondition, route);
        if (result !== 0) {
            return result;
        }
        result = this.patternsCondition.compareTo(value.patternsCondition, route);
        if (result !== 0) {
            return result;
        }
        result = this.customConditionHolder.compareTo(value.customConditionHolder, route);
        if (result !== 0) {
            return result;
        }
        return 0;
    }
    _mergeNames(value) {
        console.log('RouteMappingInfo::_mergeName', this.name, value.name);
        if (this.name && value.name) {
            return `${this.name}${separator}${value.name}`.replace(/\/\//g, '/');
        }
        else if (this.name) {
            return this.name;
        }
        else {
            return value.name;
        }
    }
}
export class RouteMappingInfoHandlerMethodMappingNamingStrategy {
    static separator;
    getName(handlerMethod, mapping) {
        if (mapping.name) {
            return mapping.name;
        }
        return `${handlerMethod.name}${separator}${handlerMethod.method}`;
    }
}
defineProperty(RouteMappingInfoHandlerMethodMappingNamingStrategy, 'separator', {
    value: separator,
    configurable: true,
    enumerable: false,
    writable: false,
});
/**
 * * Developer Notes
 * TODO Create a condition for public vs. private routes if that's still going to be a thing in BlueJS3
 * ? Should we grab cookies and put them on the Route so developers don't need to touch document? If so a condition needs to be made.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtbWFwcGluZy1pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLW1hcHBpbmctaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBZSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTNFLE9BQU8sRUFDSCwyQkFBMkIsRUFDM0Isc0JBQXNCLEVBRXRCLG9CQUFvQixFQUNwQixrQkFBa0IsR0FDckIsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDbkIsY0FBYyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUM1RSxZQUFZLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLEVBQzFFLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFFbkI7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7QUFFRjs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxlQUFnQixTQUFRLDJCQUFtQztJQUMzRCxZQUFZLENBQWM7SUFFbkMsSUFBSSxtQkFBbUI7UUFDbkIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFlBQVksVUFBa0I7UUFDMUIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2pDLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBVTtZQUN4QixZQUFZLEVBQUUsSUFB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