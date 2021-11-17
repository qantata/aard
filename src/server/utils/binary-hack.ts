export default function () {
  var childProcess = require("child_process");
  var origSpawn = childProcess.spawn;
  function spawn() {
    arguments["2"]["cwd"] = process.cwd();
    return origSpawn.apply(this, arguments);
  }
  childProcess.spawn = spawn;
}
