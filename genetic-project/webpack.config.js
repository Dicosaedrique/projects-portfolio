const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_, argv) => {
    const IS_DEV = argv.mode === "development";

    const options = {
        entry: "./src/scripts/index.ts",
        module: {
            rules: [
                // gère les workers
                {
                    test: /\.worker\.ts$/,
                    use: { loader: "worker-loader" },
                },
                // gère le typescript
                {
                    test: /\.(t|j)s$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        output: {
            path: path.resolve(__dirname, "./dist/"),
            filename: "bundle.client.js",
        },
        plugins: [new HtmlWebpackPlugin({ template: "./src/views/index.html" })],
    };

    if (IS_DEV) {
        options.devtool = "inline-source-map";
        options.devServer = {
            open: true,
        };
    }

    return options;
};
