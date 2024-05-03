"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client/client");
const decoder_1 = require("./internal/decoder");
async function main() {
    try {
        const feedIds = process.argv.slice(2);
        if (feedIds.length === 0) {
            console.error("Usage: node dist/main-multiple-feeds.js <feedId1> <feedId2> ...");
            process.exit(1);
        }
        console.log("Fetching reports for feed IDs:", feedIds.join(", "));
        const reports = await (0, client_1.fetchSingleReportManyFeeds)(feedIds);
        // console.log("Reports received:", reports);
        reports.forEach((report) => {
            if (typeof report.fullReport === "string") {
                console.log("\n=================================================================================================\n\nProcessing report for Feed ID: " +
                    report.feedID +
                    "\n");
                (0, decoder_1.processFullReport)(report.fullReport);
            }
            else {
                console.error("Expected fullReport to be a string for feed ID:", report.feedID);
            }
        });
    }
    catch (error) {
        console.error("Error in main function:", error);
        process.exit(1);
    }
}
main();
