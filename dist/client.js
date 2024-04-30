"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSingleReportManyFeeds = exports.fetchSingleReportSingleFeed = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
require("dotenv").config();
function generateHMAC(method, path, // Ensure this is the full path including query parameters
body, // Assuming body is empty for GET requests
clientId, timestamp, userSecret) {
    const bodyHash = (0, crypto_1.createHash)("sha256")
        .update(body || "")
        .digest("hex");
    const hmacBaseString = `${method} ${path} ${bodyHash} ${clientId} ${timestamp}`;
    console.log("Generating HMAC with the following string:", hmacBaseString);
    const hmac = (0, crypto_1.createHmac)("sha256", userSecret);
    hmac.update(hmacBaseString);
    return hmac.digest("hex");
}
function generateAuthHeaders(method, fullPath, // fullPath includes the domain and query parameters
clientId, userSecret) {
    const timestamp = Date.now();
    const hmacString = generateHMAC(method, fullPath, "", clientId, timestamp, userSecret);
    return {
        Authorization: clientId,
        "X-Authorization-Timestamp": timestamp.toString(),
        "X-Authorization-Signature-SHA256": hmacString,
    };
}
const path = "/api/v1/reports";
const bulkPath = "/api/v1/reports/bulk";
async function fetchSingleReportSingleFeed(feedId) {
    const baseUrl = process.env.BASE_URL; // Ensure this is just the domain and path without protocol
    const clientId = process.env.CLIENT_ID;
    const userSecret = process.env.CLIENT_SECRET;
    if (!baseUrl || !clientId || !userSecret) {
        throw new Error("Missing required environment variables");
    }
    const timestamp = Date.now(); // Synchronized timestamp for the request
    const params = new URLSearchParams({
        feedID: feedId,
        timestamp: Math.floor(timestamp / 1000).toString(),
    });
    const url = `https://${baseUrl}${path}?${params.toString()}`;
    const headers = generateAuthHeaders("GET", url, clientId, userSecret);
    console.log("Final URL:", url);
    console.log("Headers:", headers);
    try {
        const response = await axios_1.default.get(url, { headers });
        return response.data.report;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("Axios Error Status:", error.response?.status);
            console.error("Axios Error Body:", error.response?.data);
        }
        else {
            console.error("Unexpected Error:", error);
        }
        throw error; // Re-throw to handle it further up the call stack or log it accordingly
    }
}
exports.fetchSingleReportSingleFeed = fetchSingleReportSingleFeed;
async function fetchSingleReportManyFeeds(feedIds) {
    const baseUrl = process.env.BASE_URL;
    const clientId = process.env.CLIENT_ID;
    const userSecret = process.env.CLIENT_SECRET;
    if (!baseUrl || !clientId || !userSecret) {
        throw new Error("Missing required environment variables");
    }
    const timestamp = Date.now() - 500;
    const params = new URLSearchParams({
        feedIDs: feedIds.join(","),
        timestamp: Math.floor(timestamp / 1000).toString(),
    });
    const req = {
        method: "GET",
        url: `https://${baseUrl}${bulkPath}`,
        params,
        headers: generateAuthHeaders("GET", `${bulkPath}?${params.toString()}`, clientId, userSecret),
    };
    console.log("base: ", baseUrl);
    console.log("header: ", req.headers);
    console.log("params: ", params.toString());
    try {
        const response = await axios_1.default.request(req);
        if (response.status !== 200) {
            throw new Error(`Unexpected status code ${response.status}: ${response.data}`);
        }
        const res = response.data;
        return res.reports;
    }
    catch (error) {
        console.error(error);
        throw error; // Re-throw to allow handling in calling code
    }
}
exports.fetchSingleReportManyFeeds = fetchSingleReportManyFeeds;
