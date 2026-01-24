const
    path = require( 'path' ),
    { ContextReplacementPlugin } = require( 'webpack' ),
    CircularDependencyPlugin = require( 'circular-dependency-plugin' ),
    ForkTsCheckerWebpackPlugin = require( 'fork-ts-checker-webpack-plugin' ),
    TerserPlugin = require( 'terser-webpack-plugin' ),
    TsConfigPathsPlugin = require( 'tsconfig-paths-webpack-plugin' ),

    tsconfig = path.resolve( 'tsconfig.build.json' ),
    supportedLocales = [ 'en-US', 'es' ];

module.exports = {
    devtool: 'hidden-source-map',
    entry: {
        index: './src/index.ts'
    },
    // This assumes @blue/* packages are peer depedendencies
    externals: /^@blue\/.+$/,
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    colors: true,
                    configFile: tsconfig,
                    happyPackMode: true,
                    transpileOnly: true
                }
            },
            {
                test: /\.(png|jpe?g|gif|pdf)$/i,
                loader: 'url-loader',
                options: {
                    limit: false
                }
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin( {
                parallel: 4,
                terserOptions: {
                    mangle: true,
                    module: true,
                    warnings: true
                }
            } )
        ]
    },
    output: {
        filename: 'index.js',
        globalObject: 'globalThis',
        library: {
            name: {
                root: 'Blue',
                amd: 'blue',
                commonjs: 'blue'
            },
            export: 'default',
            type: 'umd'
        },
        path: path.resolve( __dirname, '' )
    },
    plugins: [
        new CircularDependencyPlugin( {
            entry: './src/index',
            exclude: /node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
            onStart( { compilation } ) {
                console.log( 'start detecting webpack modules cycles' );
            },
            onDetected( { module: webpackModuleRecord, paths, compilation } ) {
                console.error( 'DETECTED' );
                compilation.errors.push( new Error( paths.join( ' -> ' ) ) );
            },
            onEnd( { compilation } ) {
                console.log( 'end detecting webpack modules cycles' );
            },
        } ),
        new ContextReplacementPlugin( /seedrandom[\/\\]lib$/, /alea/ ),
        new ContextReplacementPlugin( /date\-fns[\/\\]/, new RegExp( `[/\\\\\](${ supportedLocales.join( '|' ) })[/\\\\\]index\.js$` ) ),
        new ForkTsCheckerWebpackPlugin( {
            typescript: {
                configFile: tsconfig
            }
        } ),
        //new IgnorePlugin( /^\.\/lib\/(tychei|xor128|xor4096|xorshift7|xorwow)$/, /seedrandom$/ ),
        //new IgnorePlugin( /^\.\/locale$/, /moment$/ )
    ],
    stats: {
        modules: false,
        colors: true,
    },
    resolve: {
        extensions: [ '.ts', '.js', '.tsx', '.jsx' ],
        plugins: [
            new TsConfigPathsPlugin( {
                configFile: tsconfig
            } ),
        ]
    }
};

/*
const
    path = require( 'path' ),
    { ContextReplacementPlugin, IgnorePlugin } = require( 'webpack' ),
    CircularDependencyPlugin = require( 'circular-dependency-plugin' ),
    TerserPlugin = require( 'terser-webpack-plugin' ),
    TsConfigPathsPlugin = require( 'tsconfig-paths-webpack-plugin' ),
    supportedLocales = [ 'en-US', 'es' ];

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',

    entry: {
        index: './src/index.ts'
    },

    // This assumes @blue/* packages are peer depedendencies
    externals: /^@blue\/.+$/,

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    colors: true,
                    configFile: 'tsconfig.build.json'
                }
            },
            {
                test: /\.(png|jpe?g|gif|pdf)$/i,
                loader: 'url-loader',
                options: {
                    limit: false
                }
            }
        ]
    },

    optimization: {
        minimizer: [
            new TerserPlugin( {
                parallel: 4,
                terserOptions: {
                    mangle: true,
                    module: true,
                    warnings: true
                }
            } )
        ]
    },

    output: {
        filename: '[name].js',
        globalObject: 'globalThis',
        library: {
            name: {
                root: 'Blue',
                amd: 'blue',
                commonjs: 'blue'
            },
            type: 'umd'
        },
        path: path.resolve( __dirname, '' )
    },

    plugins: [
        new CircularDependencyPlugin( {
            entry: './src/index',
            exclude: /node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
            onStart( { compilation } ) {
                console.log( 'start detecting webpack modules cycles' );
            },
            onDetected( { module: webpackModuleRecord, paths, compilation } ) {
                console.error( 'DETECTED' );
                compilation.errors.push( new Error( paths.join( ' -> ' ) ) );
            },
            onEnd( { compilation } ) {
                console.log( 'end detecting webpack modules cycles' );
            },
        } ),
        new ContextReplacementPlugin( /seedrandom[\/\\]lib$/, /alea/ ),
        new ContextReplacementPlugin( /date\-fns[\/\\]/, new RegExp( `[/\\\\\](${ supportedLocales.join( '|' ) })[/\\\\\]index\.js$` ) ),
        //new IgnorePlugin( /^\.\/lib\/(tychei|xor128|xor4096|xorshift7|xorwow)$/, /seedrandom$/ ),
        //new IgnorePlugin( /^\.\/locale$/, /moment$/ ),
        new IgnorePlugin( /^unicode\/category\/So$/, /slug$/ )
    ],

    resolve: {
        extensions: [ '.ts', '.js', '.tsx', '.jsx' ],
        plugins: [
            new TsConfigPathsPlugin(),
        ]
    }
};
*/
