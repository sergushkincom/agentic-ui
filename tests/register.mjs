import { register } from "node:module";

// Lib modules import each other without a file extension. Node's type stripper needs one.
register("./resolve-ts.mjs", import.meta.url);
