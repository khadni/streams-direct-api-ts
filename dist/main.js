"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
const ethers_1 = require("ethers");
const client_1 = require("./client");
const decoder_1 = require("./decoder");
async function main() {
    console.log("Starting the main function.");
    try {
        console.log("Received feed ID:", process.argv[2]);
        const feedId = process.argv[2];
        if (!feedId) {
            console.error("Usage: node dist/main.js <feedId>");
            process.exit(1);
        }
        console.log("Fetching single report for feed ID:", feedId);
        const report = await (0, client_1.fetchSingleReportSingleFeed)(feedId);
        console.log("Report received:", report);
        if (typeof report.fullReport === "string") {
            console.log("Decoding full report");
            const fullReportBuffer = ethers_1.ethers.utils.arrayify(report.fullReport);
            const decodedReport = await (0, decoder_1.decodeFullReportAndReportData)(fullReportBuffer);
            console.log("Decoded Report:", decodedReport);
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
