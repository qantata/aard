// @ts-nocheck typing child_process is a pain

import * as path from "path";

export default function () {
  var childProcess = require("child_process");
  var origSpawn = childProcess.spawn;
  function spawn() {
    /*
     * Add binaries that libraries use here.
     * pkg currently has an issue that prevents child_process.spawn() calls
     * from calling binaries from within the binary (might be spawn() problem, not pkg but whatever),
     * so we need to use this hack to update the path to these binaries manually.
     */
    switch (arguments["0"]) {
      case `./lib/migration-engine-debian-openssl-1.1.x`:
        arguments["0"] = path.join(process.cwd(), "lib/migration-engine-debian-openssl-1.1.x");
        break;
    }

    if (arguments["2"]) {
      arguments["2"]["cwd"] = process.cwd();
    }
    return origSpawn.apply(this, arguments);
  }
  childProcess.spawn = spawn;
}
