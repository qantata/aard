import * as fs from "fs";
import * as path from "path";

(() => {
  const clientPath = process.env.PKG
    ? "/snapshot/aard/apps/server/node_modules/.prisma/client"
    : // nexus-prisma defaults to @prisma package under the root
      // node_modules, so we need to fix it to use the server package's
      // node_modules
      path.join(process.cwd(), "node_modules/.prisma/client");

  // By default the import paths are something like /home/.../project/node_modules/.prisma/client
  // That's why we need to change them to be dynamic
  const str = `const { getPrismaClientDmmf } = require('nexus-prisma/dist-cjs/helpers/prisma')
  const ModelsGenerator = require('nexus-prisma/dist-cjs/generator/models/index')
  const { Runtime } = require('nexus-prisma/dist-cjs/generator/runtime/settingsSingleton')
  
  const gentimeSettings = {
    "projectIdIntToGraphQL": "Int",
    "jsdocPropagationDefault": "guide",
    "docPropagation": {
      "GraphQLDocs": true,
      "JSDoc": true
    },
    "prismaClientImportId": "${clientPath}"
  }
  
  const dmmf = getPrismaClientDmmf({
    // JSON stringify the values to ensure proper escaping
    // Details: https://github.com/prisma/nexus-prisma/issues/143
    // TODO test that fails without this code
    require: () => require("${clientPath}"),
    importId: gentimeSettings.prismaClientImportId,
    importIdResolved: require.resolve("${clientPath}")
  })
  
  const models = ModelsGenerator.JS.createNexusTypeDefConfigurations(dmmf, {
    runtime: Runtime.settings,
    gentime: gentimeSettings,
  })
  
  module.exports = {
    $settings: Runtime.settings.change,
    ...models,
  }\n`;

  fs.writeFileSync("./lib/nexus-prisma/index.js", str);
})();

export {};
