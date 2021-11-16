import os from "os";
import path from "path";

export const DEV = process.env.NODE_ENV === "development";
export const DATABASE_URL = path.join(os.homedir(), ".aard", DEV ? "dev.db" : "database.db");
