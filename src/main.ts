// main.ts
import { ethers } from "ethers";
import { fetchSingleReportSingleFeed } from "./client";
import { decodeFullReportAndReportData } from "./decoder";

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
    const report = await fetchSingleReportSingleFeed(feedId);
    console.log("Report received:", report);

    if (typeof report.fullReport === "string") {
      console.log("Decoding full report");
      const fullReportBuffer = ethers.utils.arrayify(report.fullReport);
      const decodedReport = await decodeFullReportAndReportData(
        fullReportBuffer
      );
      console.log("Decoded Report:", decodedReport);
    } else {
      console.error("Expected fullReport to be a string");
      throw new Error("Expected fullReport to be a string");
    }
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

main();
