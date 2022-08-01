var paths = require('react-scripts/config/paths');
var path = require ('path');

module.exports = {
    webpack: function override(config) {
        config.module.rules.push({
            test: /\.(js|jsx)$/,
            include: [
                paths.appSrc, 
                paths.appNodeModules + (process.platform === 'win32' ? '\\unifyre-web-components\\src' : '/unifyre-web-components/src'),
                paths.appNodeModules + (process.platform === 'win32' ? '\\desktop-components-library\\src' : '/desktop-components-library/src')
            ],
            loader: require.resolve('babel-loader'),
            options: {
                babelrc: false,
                presets: [require.resolve('babel-preset-react-app')],
                cacheDirectory: true,
            },
        });
        console.log('Current watch op', config)
        return config
    },
    devServer: function overrideDevServer(configFunction) {
        return function(proxy, allowedHost) {
            // Create the default config by calling configFunction with the proxy/allowedHost parameters
            const config = configFunction(proxy, allowedHost);
            config.watchOptions = {
            };
       
            // Return your customised Webpack Development Server config.
            return config;
          };
    }
}
