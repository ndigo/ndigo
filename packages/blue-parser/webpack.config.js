const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

webpackConfig.output = {
    filename: 'index.js',
    globalObject: 'globalThis',
    library: {
        name: {
            root: 'blue-parser',
            amd: 'blue-parser',
            commonjs: 'blue-parser'
        },
        export: 'default',
        type: 'umd'
    },
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
