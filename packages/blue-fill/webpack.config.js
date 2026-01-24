const
    path = require( 'path' ),
    webpackConfig = require( '../../webpack.config' );

webpackConfig.output = {
    globalObject: 'globalThis',
    filename: 'index.js',
    library: {
        name: {
            root: 'blue-fill',
            amd: 'blue-fill',
            commonjs: 'blue-fill'
        },
        export: 'default',
        type: 'umd'
    },
    path: path.resolve( __dirname, '' )
};

module.exports = webpackConfig;
