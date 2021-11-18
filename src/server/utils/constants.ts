import os from "os";
import path from "path";

export const IS_PKG = (<any>process).pkg !== undefined;
export const DEV = process.env.NODE_ENV === "development";
export const DATABASE_URL = path.join(os.homedir(), ".aard", DEV ? "dev.db" : "database.db");

const ver = process.env.AARD_VERSION;
export const VERSION = ver ? ver.slice(1, ver.length) : "UNKNOWN";
