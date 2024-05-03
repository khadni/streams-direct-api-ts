import { fetchSingleReportManyFeeds } from "./client";
import { processFullReport } from "./decoder";

async function main() {
  try {
    const feedIds = process.argv.slice(2);
    if (feedIds.length === 0) {
      console.error(
        "Usage: node dist/main-multiple-feeds.js <feedId1> <feedId2> ..."
      );
      process.exit(1);
    }

    console.log("Fetching reports for feed IDs:", feedIds.join(", "));
    const reports = await fetchSingleReportManyFeeds(feedIds);
    // console.log("Reports received:", reports);

    reports.forEach((report) => {
      if (typeof report.fullReport === "string") {
        console.log(
          "\n=================================================================================================\n\nProcessing report for Feed ID: " +
            report.feedID +
            "\n"
        );
        processFullReport(report.fullReport);
      } else {
        console.error(
          "Expected fullReport to be a string for feed ID:",
          report.feedID
        );
      }
    });
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

main();
