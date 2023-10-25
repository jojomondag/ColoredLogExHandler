import { TryCatcherErrorLogger } from "./TryCatcherErrorLogger.mjs";

//In this script i combine the TryCatch with Logging bye combining the functionality.
function TryCatcherErrorLogger() {
    try {
        throw new Error("Whoops!");
    } catch (e) {
        console.log("Error caught!");
        console.log(e);
    }
}