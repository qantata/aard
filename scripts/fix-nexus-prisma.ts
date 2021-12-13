import fs from "fs";

(() => {
  // By default the import paths are something like /home/.../project/node_modules/.prisma/client
  // That's why we need to change them to be dynamic
  const str = `const { getPrismaClientDmmf } = require('../helpers/prisma')
  const ModelsGenerator = require('../generator/models')
  const { Runtime } = require('../generator/runtime/settingsSingleton')
  
  const gentimeSettings = {
    "projectIdIntToGraphQL": "Int",
    "jsdocPropagationDefault": "guide",
    "docPropagation": {
      "GraphQLDocs": true,
      "JSDoc": true
    },
    "prismaClientImportId": "/snapshot/aard/node_modules/.prisma/client"
  }
  
  const dmmf = getPrismaClientDmmf({
    // JSON stringify the values to ensure proper escaping
    // Details: https://github.com/prisma/nexus-prisma/issues/143
    // TODO test that fails without this code
    require: () => require("/snapshot/aard/node_modules/.prisma/client"),
    importId: gentimeSettings.prismaClientImportId,
    importIdResolved: require.resolve("/snapshot/aard/node_modules/.prisma/client")
  })
  
  const models = ModelsGenerator.JS.createNexusTypeDefConfigurations(dmmf, {
    runtime: Runtime.settings,
    gentime: gentimeSettings,
  })
  
  module.exports = {
    $settings: Runtime.settings.change,
    ...models,
  }\n`;

  fs.writeFileSync("node_modules/nexus-prisma/dist-cjs/runtime/index.js", str);
})();

export {};
