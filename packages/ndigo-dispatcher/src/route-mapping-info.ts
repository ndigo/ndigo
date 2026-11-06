/**
 */
// Barrel: the route-mapping condition model and mapping-info aggregates were
// split into cohesive modules (query/matrix/patterns conditions, the mapping
// composite, and the naming strategy). This file re-exports the exact
// original public API so intra-package imports of './route-mapping-info'
// and the package index remain unchanged.

export { QueryParamExpression, QueryParamCondition } from './query-param-condition';
export { MatrixParamExpression, MatrixParamCondition } from './matrix-param-condition';
export { PatternsRouteCondition } from './patterns-route-condition';
export { RouteMappingInfo } from './route-mapping-info-model';
export { RouteMappingInfoHandlerMethodMappingNamingStrategy } from './route-mapping-info-naming-strategy';
