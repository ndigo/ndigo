const
  path = require( 'path' ),
  webpackConfig = require( '../../webpack.config' ),
  { assign } = Object;

indexConfig = assign( {}, webpackConfig, {
    output: {
        globalObject: 'globalThis',
        library: {
            name: {
                root: 'blue-has',
                amd: 'blue-has',
                commonjs: 'blue-has'
            },
            type: 'umd'
        },
        path: path.resolve( __dirname, '' )
    }
} );

webConfig = assign( {}, webpackConfig, {
    entry: {
        web:'./src/web.ts'
    },
    output: {
        globalObject: 'globalThis',
        library: {
            name: 'blue-has',
            type: 'amd'
        },
        path: path.resolve( __dirname, '' )
    }
} );

nodeConfig = assign( {}, webpackConfig, {
    entry: {
        node:'./src/node.ts'
    },
    output: {
        globalObject: 'globalThis',
        library: {
            name:'blue-has',
            type: 'commonjs2'
        },
        path: path.resolve( __dirname, '' )
    }
} );

module.exports = [ indexConfig, nodeConfig, webConfig ];
