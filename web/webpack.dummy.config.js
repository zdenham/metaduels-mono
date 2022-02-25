const path = require("path");

module.exports = {
  mode: "development",
  entry: ["./app/dummy.js"],
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "dummy-bundle.js",
  },
  devtool: "sourcemap",
};
