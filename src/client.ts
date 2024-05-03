import axios from "axios";
import { createHash, createHmac } from "crypto";

require("dotenv").config();

interface AuthHeaders {
  Authorization: string;
  "X-Authorization-Timestamp": string;
  "X-Authorization-Signature-SHA256": string;
}

interface SingleReport {
  feedID: string;
  validFromTimestamp: number;
  observationsTimestamp: number;
  fullReport: string;
}

interface SingleReportResponse {
  report: SingleReport;
}

interface BulkReportResponse {
  reports: SingleReport[];
}

function generateHMAC(
  method: string,
  url: string,
  body: string,
  clientId: string,
  userSecret: string
): string {
  const bodyHash = createHash("sha256")
    .update(body || "")
    .digest("hex");
  const timestamp = Date.now();
  const pathWithQuery = new URL(url).pathname + new URL(url).search;
  const hmacBaseString = `${method} ${pathWithQuery} ${bodyHash} ${clientId} ${timestamp}`;
  console.log("Generating HMAC with the following string:", hmacBaseString);

  const hmac = createHmac("sha256", userSecret);
  hmac.update(hmacBaseString);
  return hmac.digest("hex");
}

function generateAuthHeaders(
  method: string,
  url: string,
  clientId: string,
  userSecret: string
): AuthHeaders {
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

export async function fetchSingleReportSingleFeed(
  feedId: string
): Promise<SingleReport> {
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
    const response = await axios.get<SingleReportResponse>(url, {
      headers: { ...headers },
    });
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.data.report;
  } catch (error) {
    console.error("HTTP Request Failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    }
    throw error;
  }
}

export async function fetchSingleReportManyFeeds(
  feedIds: string[]
): Promise<SingleReport[]> {
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
    const response = await axios.get<BulkReportResponse>(url, {
      headers: { ...headers },
    });
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.data.reports;
  } catch (error) {
    console.error("HTTP Request Failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    }
    throw error;
  }
}
