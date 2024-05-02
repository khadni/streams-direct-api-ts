import { fetchSingleReportSingleFeed } from "./client";
import { processFullReport } from "./decoder";

async function main() {
  try {
    const feedId = process.argv[2];
    if (!feedId) {
      console.error("Usage: node dist/main.js <feedId>");
      process.exit(1);
    }

    console.log("Fetching single report for feed ID:", feedId);
    const report = await fetchSingleReportSingleFeed(feedId);
    console.log("-------------------------");
    console.log("Report received:", report);

    if (typeof report.fullReport === "string") {
      processFullReport(report.fullReport); // Use the imported function directly
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
