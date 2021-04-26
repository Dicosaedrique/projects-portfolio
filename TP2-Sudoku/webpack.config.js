const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/script/main.js",
    output: {
        path: path.resolve(__dirname, "./dist/"),
        filename: "bundle.client.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [new HtmlWebpackPlugin({ template: "./src/views/index.html" })],
    devServer: {
        open: true,
    },
};
