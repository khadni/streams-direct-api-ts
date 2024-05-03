"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSingleReportManyFeeds = exports.fetchSingleReportSingleFeed = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
require("dotenv").config();
function generateHMAC(method, url, body, clientId, userSecret) {
    const bodyHash = (0, crypto_1.createHash)("sha256")
        .update(body || "")
        .digest("hex");
    const timestamp = Date.now();
    const pathWithQuery = new URL(url).pathname + new URL(url).search;
    const hmacBaseString = `${method} ${pathWithQuery} ${bodyHash} ${clientId} ${timestamp}`;
    console.log("Generating HMAC with the following string:", hmacBaseString);
    const hmac = (0, crypto_1.createHmac)("sha256", userSecret);
    hmac.update(hmacBaseString);
    return hmac.digest("hex");
}
function generateAuthHeaders(method, url, clientId, userSecret) {
    const hmacSignature = generateHMAC(method, url, "", clientId, userSecret);
    const timestamp = Date.now();
    return {
        Authorization: clientId,
        "X-Authorization-Timestamp": timestamp.toString(),
        "X-Authorization-Signature-SHA256": hmacSignature,
    };
}
const path = "/api/v1/reports";
const bulkPath = "/api/v1/reports/bulk";
async function fetchSingleReportSingleFeed(feedId) {
    const baseUrl = process.env.BASE_URL;
    const clientId = process.env.CLIENT_ID;
    const userSecret = process.env.CLIENT_SECRET;
    if (!baseUrl || !clientId || !userSecret) {
        throw new Error("Missing required environment variables");
    }
    const timestamp = Date.now();
    const params = new URLSearchParams({
        feedID: feedId,
        timestamp: Math.floor(timestamp / 1000).toString(),
    });
    const url = `https://${baseUrl}${path}?${params.toString()}`;
    const headers = generateAuthHeaders("GET", url, clientId, userSecret);
    // console.log("Final URL:", url);
    // console.log("Headers:", headers);
    try {
        const response = await axios_1.default.get(url, {
            headers: { ...headers },
        });
        if (response.status !== 200) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.data.report;
    }
    catch (error) {
        console.error("HTTP Request Failed:", error);
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
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
    const timestamp = Date.now();
    const params = new URLSearchParams({
        feedIDs: feedIds.join(","),
        timestamp: Math.floor(timestamp / 1000).toString(),
    });
    const url = `https://${baseUrl}${bulkPath}?${params.toString()}`;
    const headers = generateAuthHeaders("GET", url, clientId, userSecret);
    try {
        const response = await axios_1.default.get(url, {
            headers: { ...headers },
        });
        if (response.status !== 200) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.data.reports;
    }
    catch (error) {
        console.error("HTTP Request Failed:", error);
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
}
exports.fetchSingleReportManyFeeds = fetchSingleReportManyFeeds;
