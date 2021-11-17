module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: "./src/client",
  schema: "./schema.graphql",
  exclude: ["./src/server", "**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
}