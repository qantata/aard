import * as os from "os";
import * as path from "path";

export const IS_PKG = (<any>process).pkg !== undefined;
export const DEV = process.env.NODE_ENV === "development";
export const DATA_DIR = path.join(os.homedir(), ".aard");
export const DATABASE_URL = path.join(DATA_DIR, DEV ? "dev.db" : "database.db");
export const PKG_SERVER_DIR = "/snapshot/aard/apps/server";

export const VERSION = () => {
  return process.env.AARD_VERSION !== undefined ? process.env.AARD_VERSION : "UNKNOWN";
};
