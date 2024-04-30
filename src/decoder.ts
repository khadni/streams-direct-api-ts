// decoder.ts

import { ethers } from "ethers";

interface FeedID {
  value: string; // This would be equivalent to the `mercuryutils.FeedID`
  version: number; // Placeholder for the actual version extraction logic
}

interface V3Report {
  validFromTimestamp: number;
  observationsTimestamp: number;
  nativeFee: BigInt;
  linkFee: BigInt;
  expiresAt: number;
  benchmarkPrice: BigInt;
  bid: BigInt;
  ask: BigInt;
}

interface ReportWithContext {
  feedId: FeedID;
  feedVersion: number;
  v3Report?: V3Report;
  round: number;
  epoch: number;
  digest: Uint8Array;
}

interface FullReport {
  reportContext: [Uint8Array, Uint8Array, Uint8Array];
  reportBlob: Uint8Array;
  rawRs: Uint8Array[];
  rawSs: Uint8Array[];
  rawVs: Uint8Array;
}

const abi = [
  "function decodeFullReport(bytes) external returns (bytes32[3], bytes, bytes32[], bytes32[], bytes32)",
];
const reportDecoder = new ethers.utils.Interface(abi);

function decodeFullReport(fullReport: Uint8Array): FullReport {
  const dataHex = ethers.utils.hexlify(fullReport);
  try {
    const decoded = reportDecoder.decodeFunctionData(
      "decodeFullReport",
      dataHex
    );
    return {
      reportContext: [decoded[0][0], decoded[0][1], decoded[0][2]],
      reportBlob: decoded[1],
      rawRs: decoded[2],
      rawSs: decoded[3],
      rawVs: decoded[4],
    };
  } catch (error) {
    console.error("Failed to decode report:", error);
    throw new Error("Decoding failed");
  }
}

function decodeReportData(reportBlob: Uint8Array): {
  feedId: FeedID;
  report: V3Report | null;
} {
  const feedIdBytes = new Uint8Array(reportBlob.slice(0, 32));
  const feedId = {
    value: ethers.utils.hexlify(feedIdBytes),
    version: parseInt(ethers.utils.hexlify(feedIdBytes.slice(0, 1)), 16), // Assuming version is stored in the first byte
  };

  // actual decoding logic here based on the feed version (only v3 for now)
  return {
    feedId,
    report: null, // assuming decoding logic will populate this based on version
  };
}

function decodeFullReportAndReportData(fullReport: Uint8Array) {
  const fullReportDecoded = decodeFullReport(fullReport);
  // Assuming reportBlob is also a Uint8Array that needs further decoding
  const reportData = decodeReportData(fullReportDecoded.reportBlob);
  return {
    fullReport: fullReportDecoded,
    reportData: reportData,
  };
}

export { decodeFullReportAndReportData };
