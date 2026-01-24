/* global appRoutes, define */
/**
 * @author Mark Saunders & Aravind Rajendran
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @module blue/router
 * @requires blue/hash
 * @requires blue/log
 */
define(function (require) {
    var asContextual = require('blue/as/contextual'),
        hasher = require('blue/hash'),
        intercept = require('blue/intercept'),
        is = require('blue/is'),
        logger = require('blue/log')('[site]'),
        root = require('blue/root'),
        withRoutingAPI = require('blue/with/routingAPI'),
        screenChannel = require('blue/event/channel/screen'),
        initialized = false,
        _noBeginningSlashRegexp = /(^[^\/])/g,
        _multiSlashRegexp = /([^:])\/{2,}/g, // captures two or more / except when proceeded by :
        _multiQuestionMarksRegexp = /\?{2,}/g,
        _trailingSlashRegexp = /\/$/,
        defaultApp,
        oldHash,
        lastHistoryIndex = 1,
        routeId = 0,
        routeTracking = {},
        routingAPI = {},
        aborting = false,
        nextRouteId = function () {
            return ++routeId;
        },
        getHistoryIndex = function () {
            return root.history && root.history.state ? root.history.state : 1;
        },
        normalizeHash = function (route) {
            if (route && route[0] !== '#') {
                route = '#' + route;
            }
            var hash = hasher.getHash(route),
                urlModified,
                newHash = hash,
                parsedHash;

            urlModified =
                _noBeginningSlashRegexp.test(hash) ||
                _multiSlashRegexp.test(hash) ||
                _multiQuestionMarksRegexp.test(hash) ||
                _trailingSlashRegexp.test(hash);
            if (urlModified) {
                newHash = hash
                    .replace(_noBeginningSlashRegexp, '/$1')
                    .replace(_multiSlashRegexp, '$1/')
                    .replace(_multiQuestionMarksRegexp, '')
                    .replace(_trailingSlashRegexp, '');
            }

            // Fill out rest of hash route if only a partial route is provided (e.g. #/foo or #/foo/bar)
            parsedHash = hasher.parseMatrixParamHash(newHash);
            var pathLength = parsedHash.pathSegments.length;
            if (pathLength === 0) {
                newHash = '/' + defaultApp + '/index/index';
            } else if (pathLength === 1) {
                newHash =
                    parsedHash.pathOnly + '/index/index' + (parsedHash.queryString ? '?' + parsedHash.queryString : '');
            }
            // Cannot have an area named "index", so if "index" appears in
            // the second segment, it must be a controller
            if (pathLength === 2 && parsedHash.pathSegments[1] === 'index') {
                newHash = parsedHash.pathOnly + '/index' + (parsedHash.queryString ? '?' + parsedHash.queryString : '');
            }

            return newHash;
        },
        fragmentFromHref = function (href) {
            if (!href) {
                return '';
            }
            var hashIdx = href.indexOf('#');
            if (hashIdx >= 0) {
                // if href like http://server.com/#
                if (href.length <= hashIdx + 1) {
                    href = '';
                } else {
                    href = href.substr(hashIdx + 1);
                }
            }
            // Drop leading /
            return href[0] === '/' ? href.substr(1) : href;
        },
        /**
         * Private function to be included in "tools" object when executing route. This function may
         * be called by route interceptors to help interpret a route when making routing decisions.
         */
        parseRoute = function (route) {
            var obj = {},
                fragment = fragmentFromHref(route),
                qParts = fragment.split('?'),
                segments = qParts[0].split('/');

            obj.segments = [];
            segments.forEach(function (segment) {
                if (segment.length) {
                    obj.segments.push(hasher.parseSegment(segment));
                }
            });

            obj.query = {};
            obj.query.string = qParts[1] || '';
            obj.query.params = hasher.getParamsObj(route) || {};

            return obj;
        },
        /**
         * Private function that wraps all route requests. For "external" requests (changes to URL bar), will
         * also manage restoring prior state if an interceptor causes the route change to be abandoned.
         */
        submitRoute = function (_this, routeId, opts) {
            var source = opts.source,
                historyState = opts.historyState ? opts.historyState : 1,
                data = {
                    oldRoute: oldHash,
                    newRoute: opts.route,
                },
                tools = {
                    parseRoute: parseRoute,
                };

            // Every new route request (even if going "back" in history) should generate a new
            // routeId for the routeTracking map. If our routeId is already in use, something
            // has gone wrong and we should ignore this route request.
            if (routeTracking[routeId]) {
                return;
            }

            // Store route request in new routeTracking object
            routeTracking[routeId] = {
                source: opts.source,
                historyState: historyState,
            };

            // Call _executeRoute. This method may have interceptors defined by in the application.
            _this._executeRoute(_this.context, data, tools, routeId);

            // If _executeRoute was never executed (due to interceptor behavior), and if route request
            // was external, current URL state is probably out of synch with current application state.
            // Restore URL state to put everything back in synch again.
            if (
                root.history &&
                !routeTracking[routeId].done &&
                source === 'external' &&
                (is.undefined(oldHash) || opts.route !== oldHash)
            ) {
                aborting = true;
                // user went forwards to new history entry, so we just go back to the prior entry
                if (!historyState) {
                    root.history.go(-1);
                } else {
                    root.history.go(lastHistoryIndex - historyState);
                }
                routeTracking[routeId].done = 'aborted';
            }
        };

    var Router = function Router(name, parentContext) {
        var _this = this;

        this.name = 'router';
        this.defineContext(parentContext);

        withRoutingAPI.call(routingAPI);

        this.defineInterceptors();

        this.context.on('publicRoute', function (msg) {
            var hash = normalizeHash(msg.route),
                id = nextRouteId();
            submitRoute(_this, id, {
                source: 'public',
                route: hash,
                historyState: getHistoryIndex(),
            });
        });
        this.context.on('privateRoute', function (msg) {
            var hash = normalizeHash(msg.route),
                id = nextRouteId();
            submitRoute(_this, id, {
                source: 'private',
                route: hash,
                historyState: getHistoryIndex(),
            });
        });
    };

    Router.prototype = Object.create(null);
    Router.prototype.constructor = Router;

    // context = router context, child of site context
    // data = object with properties: newRoute, oldRoute
    // tools = object with functions that are useful for route interpretation and changes
    // routeId = index of this route request in the private routeTracking map, used to
    // 		retrieve route information that isn't needed by interceptors
    Router.prototype._executeRoute = function (context, data, tools, routeId) {
        var opts = routeTracking[routeId],
            source = opts.source || 'external',
            hash = data.newRoute,
            parsedHash = hasher.parseMatrixParamHash(hash),
            newHistoryIndex;

        // Private routes will only emit message, no change to location bar, no analytics message on screenChannel
        // Private routes have always been synchronous, so execute the route outside the setTimeout
        if (source === 'private') {
            parsedHash.mapping = parsedHash.pathSegments.join('.');
            context.site.emitChildren('processRoute', parsedHash);
        } else {
            // BLUEJS-2894 - add asynchronicity to route changes
            // Only force asynchronous execution for public and external routes, which used to be triggered by
            // window hashChange event.
            setTimeout(function () {
                if (root.history && source === 'external') {
                    newHistoryIndex = opts.historyState;
                    // Force update to current hash in case normalizeHash made a change that should
                    // be reflected in the URL bar
                    hasher.replaceHash(hash);
                    lastHistoryIndex = newHistoryIndex;
                }
                if (is.undefined(oldHash) || hash !== oldHash) {
                    oldHash = hash; // maybe able to use routeHistory instead?
                    parsedHash.mapping = parsedHash.pathSegments.join('.');

                    // Update window location without triggering onHashChange event
                    if (source === 'public') {
                        newHistoryIndex = lastHistoryIndex + 1;
                        root.history && root.history.pushState(newHistoryIndex, undefined, '#' + hash);
                        lastHistoryIndex = newHistoryIndex;
                    }

                    context.parent.routeHistory.saveRoute('site', hash);
                    context.site.emitChildren('processRoute', parsedHash);
                }
                root.location &&
                    screenChannel.emtest('screen', {
                        oldUrl: context.parent.routeHistory.lastRoute(),
                        newUrl: root.location.href,
                        canonicalRoute: hasher.getCanonicalRoute(),
                    });
            }, 0);
        }
        routeTracking[routeId].done = 'complete';
    };

    Router.prototype.updateHash = function (newHash) {
        var hash = normalizeHash(newHash);
        // Update current history entry with new hash, but leave current state value unchanged
        root.history && root.history.replaceState(getHistoryIndex(), undefined, '#' + hash);
        oldHash = hash;
    };

    Router.prototype.hashChangeListen = function () {
        var _this = this;
        if (root.history) {
            root.onhashchange = function (evt) {
                var hash = '',
                    id = nextRouteId(),
                    nextIdx = lastHistoryIndex + 1;

                // Aborting a user-driven route change may trigger a hash change, which will
                // loop through the process again. To avoid this, don't act on the hash
                // change event if we are currently aborting a route request.
                if (aborting) {
                    aborting = false;
                } else {
                    hash = normalizeHash(hasher.getHash(evt.newURL));
                    // IE has unusual history state management relative to execution of onhashchange
                    // callback, so must manage current state index here.
                    if (!root.history.state || root.history.state === lastHistoryIndex) {
                        root.history.replaceState(nextIdx, undefined, '#' + hash);
                    }
                    submitRoute(_this, id, {
                        source: 'external',
                        route: hash,
                        historyState: getHistoryIndex(),
                    });
                }
            };
        }
    };

    Router.prototype.handleInitialRoute = function () {
        var hash = normalizeHash(),
            id = nextRouteId();
        submitRoute(this, id, {
            source: 'external',
            route: hash,
            historyState: getHistoryIndex(),
        });
    };

    // Call only once
    Router.prototype.init = function (interceptors) {
        defaultApp = appRoutes && appRoutes[0] ? appRoutes[0] : 'app';

        if (initialized) {
            logger.debug('!!!! ROUTER SHOULD ONLY BE INITIALIZED ONCE');
            return;
        }
        initialized = true;

        if (interceptors) {
            this.interceptors = interceptors;
        }

        // Check if the hash event is supported in browser
        // if ('onhashchange' in root) {
        // 	logger.debug('The browser supports the hashchange event!');
        // }

        // logger.debug('Inside router.init & initial hash is "'+hasher.getHash() +'"');

        // Check if the hash exists on ready and initialize the app
        if (hasher.getHash() !== '') {
            var hashArr = hasher.getHashArr();
            var appName = hashArr[0] ? hashArr[0].split(';')[0] : '';
            if (defaultApp !== appName) {
                // BLUEJS-943 - Update bad app in route with appRoutes[ 0 ], but remember the bad
                // route in case we want to refer to it later
                this.context.parent.routeHistory.saveRoute('site');
                this.context.parent.routeHistory.saveRoute('redirect');
                hasher.replaceHash(defaultApp);
            }
        } else {
            // if there is no hash, routes to default
            hasher.replaceHash(defaultApp);
        }
    };

    Router = asContextual.call(Router, { name: 'router' });
    intercept.withInterceptors.call(Router.prototype, '_executeRoute');

    return Router;
});
