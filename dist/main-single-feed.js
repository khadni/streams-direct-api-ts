"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const decoder_1 = require("./decoder");
async function main() {
    try {
        const feedId = process.argv[2];
        if (!feedId) {
            console.error("Usage: node dist/main.js <feedId>");
            process.exit(1);
        }
        console.log("Fetching single report for feed ID:", feedId);
        const report = await (0, client_1.fetchSingleReportSingleFeed)(feedId);
        // console.log("Report received:", report);
        if (typeof report.fullReport === "string") {
            console.log("\n=================================================================================================\n\nProcessing report for Feed ID: " +
                report.feedID +
                "\n");
            (0, decoder_1.processFullReport)(report.fullReport);
        }
        else {
            console.error("Expected fullReport to be a string");
            throw new Error("Expected fullReport to be a string");
        }
    }
    catch (error) {
        console.error("Error in main function:", error);
        process.exit(1);
    }
}
main();
