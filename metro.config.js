const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
    // 1. Get the default config
    const config = getDefaultConfig(__dirname);

    const { transformer, resolver } = config;

    // 2. Add the SVG transformer configuration
    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
    };
    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg"]
    };

    // 3. Wrap the modified config in NativeWind and export it
    return withNativeWind(config, { input: './global.css' });
})();