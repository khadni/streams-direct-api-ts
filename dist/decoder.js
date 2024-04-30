"use strict";
// decoder.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFullReportAndReportData = void 0;
const ethers_1 = require("ethers");
const abi = [
    "function decodeFullReport(bytes) external returns (bytes32[3], bytes, bytes32[], bytes32[], bytes32)",
];
const reportDecoder = new ethers_1.ethers.utils.Interface(abi);
function decodeFullReport(fullReport) {
    const dataHex = ethers_1.ethers.utils.hexlify(fullReport);
    try {
        const decoded = reportDecoder.decodeFunctionData("decodeFullReport", dataHex);
        return {
            reportContext: [decoded[0][0], decoded[0][1], decoded[0][2]],
            reportBlob: decoded[1],
            rawRs: decoded[2],
            rawSs: decoded[3],
            rawVs: decoded[4],
        };
    }
    catch (error) {
        console.error("Failed to decode report:", error);
        throw new Error("Decoding failed");
    }
}
function decodeReportData(reportBlob) {
    const feedIdBytes = new Uint8Array(reportBlob.slice(0, 32));
    const feedId = {
        value: ethers_1.ethers.utils.hexlify(feedIdBytes),
        version: parseInt(ethers_1.ethers.utils.hexlify(feedIdBytes.slice(0, 1)), 16), // Assuming version is stored in the first byte
    };
    // You'll need actual decoding logic here based on the feed version
    return {
        feedId,
        report: null, // Assuming decoding logic will populate this based on version
    };
}
function decodeFullReportAndReportData(fullReport) {
    const fullReportDecoded = decodeFullReport(fullReport);
    // Assuming reportBlob is also a Uint8Array that needs further decoding
    const reportData = decodeReportData(fullReportDecoded.reportBlob);
    return {
        fullReport: fullReportDecoded,
        reportData: reportData,
    };
}
exports.decodeFullReportAndReportData = decodeFullReportAndReportData;
