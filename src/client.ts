import axios from "axios";
import { createHash, createHmac } from "crypto";

require("dotenv").config();

interface AuthHeaders {
  Authorization: string;
  "X-Authorization-Timestamp": string;
  "X-Authorization-Signature-SHA256": string;
}

interface SingleReport {
  feedID: string; // Using string to represent hexutil.Bytes for now
  validFromTimestamp: number;
  observationsTimestamp: number;
  fullReport: string; // Using string to represent hexutil.Bytes for now
}

interface SingleReportResponse {
  report: SingleReport;
}

interface BulkReportResponse {
  reports: SingleReport[];
}

function generateHMAC(
  method: string,
  path: string, // full path including query parameters
  body: string, // body is empty for GET requests
  clientId: string,
  timestamp: number,
  userSecret: string
): string {
  const bodyHash = createHash("sha256")
    .update(body || "")
    .digest("hex");
  const hmacBaseString = `${method} ${path} ${bodyHash} ${clientId} ${timestamp}`;
  console.log("Generating HMAC with the following string:", hmacBaseString);

  const hmac = createHmac("sha256", userSecret);
  hmac.update(hmacBaseString);
  return hmac.digest("hex");
}

function generateAuthHeaders(
  method: string,
  fullPath: string, // fullPath includes the domain and query parameters
  clientId: string,
  userSecret: string
): { [key: string]: string } {
  const timestamp = Date.now();
  const hmacString = generateHMAC(
    method,
    fullPath,
    "",
    clientId,
    timestamp,
    userSecret
  );

  return {
    Authorization: clientId,
    "X-Authorization-Timestamp": timestamp.toString(),
    "X-Authorization-Signature-SHA256": hmacString,
  };
}

const path = "/api/v1/reports";
const bulkPath = "/api/v1/reports/bulk";

export async function fetchSingleReportSingleFeed(
  feedId: string
): Promise<SingleReport> {
  const baseUrl = process.env.BASE_URL; // just the domain and path without protocol
  const clientId = process.env.CLIENT_ID;
  const userSecret = process.env.CLIENT_SECRET;

  if (!baseUrl || !clientId || !userSecret) {
    throw new Error("Missing required environment variables");
  }

  const timestamp = Date.now(); // timestamp for the request

  const params = new URLSearchParams({
    feedID: feedId,
    timestamp: Math.floor(timestamp / 1000).toString(), // probably need to rework this
  });

  const url = `https://${baseUrl}${path}?${params.toString()}`;
  const headers = generateAuthHeaders("GET", url, clientId, userSecret);

  console.log("Final URL:", url);
  console.log("Headers:", headers);

  try {
    const response = await axios.get<SingleReportResponse>(url, { headers });
    return response.data.report;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Status:", error.response?.status);
      console.error("Axios Error Body:", error.response?.data);
    } else {
      console.error("Unexpected Error:", error);
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

  const timestamp = Date.now() - 500;

  const params = new URLSearchParams({
    feedIDs: feedIds.join(","),
    timestamp: Math.floor(timestamp / 1000).toString(),
  });

  const req = {
    method: "GET",
    url: `https://${baseUrl}${bulkPath}`,
    params,
    headers: generateAuthHeaders(
      "GET",
      `${bulkPath}?${params.toString()}`,
      clientId,
      userSecret
    ),
  };

  console.log("base: ", baseUrl);
  console.log("header: ", req.headers);
  console.log("params: ", params.toString());

  try {
    const response = await axios.request(req);
    if (response.status !== 200) {
      throw new Error(
        `Unexpected status code ${response.status}: ${response.data}`
      );
    }
    const res: BulkReportResponse = response.data;
    return res.reports;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
