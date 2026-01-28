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
 * A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in {@link RouteMapping|RouteMapping}.
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
     * @param {module:dispatcher.ParamsRouteCondition} value
     * @returns {number}
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
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
 */
/**
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {Array<external:string>} patterns the route patterns to use; if 0, the condition will match to every route.
 * @param {module:core.PathMatcher} pathMatcher
 * @param {boolean} useTrailingSlashMatch whether to match irrespective of a trailing slash
 * @param {Array<external:string>} [fileExtensions] a list of file extensions to consider for path matching
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtbWFwcGluZy1pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLW1hcHBpbmctaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBZSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTNFLE9BQU8sRUFDSCwyQkFBMkIsRUFDM0Isc0JBQXNCLEVBRXRCLG9CQUFvQixFQUNwQixrQkFBa0IsR0FDckIsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDbkIsY0FBYyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUM1RSxZQUFZLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLEVBQzFFLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFFbkI7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGVBQWdCLFNBQVEsMkJBQW1DO0lBQzNELFlBQVksQ0FBYztJQUVuQyxJQUFJLG1CQUFtQjtRQUNuQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsWUFBWSxVQUFrQjtRQUMxQixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEIsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakMsS0FBSyxFQUFFLElBQUksR0FBRyxFQUFVO1lBQ3hCLFlBQVksRUFBRSxJQUFJ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