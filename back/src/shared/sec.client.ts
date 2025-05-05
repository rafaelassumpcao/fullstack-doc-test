import logger from "@/config/logger";
import { SecApiResponse, SecReportHit } from "@/features/reports/types"; // Importa os tipos
import { ApiError } from "@/shared/errors/api-error"; // Criaremos este erro customizado

const SEC_API_BASE_URL = process.env.SEC_API_BASE_URL;
const SEC_API_USER_AGENT = process.env.SEC_API_USER_AGENT;

if (!SEC_API_BASE_URL || !SEC_API_USER_AGENT) {
  logger.error(
    "SEC API configuration (Base URL or User Agent) is missing in environment variables."
  );
  throw new Error("Missing SEC API configuration");
}

type FetchReportsParams = {
  cik: string;
  forms?: string[];
  startDate?: string;
  endDate?: string;
  size?: number;
};

class SecApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = SEC_API_BASE_URL!;
    this.headers = {
      "User-Agent": SEC_API_USER_AGENT || "fallback-default@gmail.com", // Fallback
      Accept: "application/json",
    };
  }

  async fetchLatestReports({
    cik,
    forms = ["10-K", "10-Q"],
    startDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate = new Date().toISOString().split("T")[0],
    size = 100,
  }: FetchReportsParams): Promise<SecReportHit[]> {
    try {
      const formattedCik = cik.padStart(10, "0");

      const params = new URLSearchParams({
        ciks: formattedCik,
        forms: forms.join(","),
        dateRange: "custom",
        startdt: startDate,
        enddt: endDate,
        category: "custom",
        size: size.toString(),
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new ApiError(
          `SEC API request failed with status ${response.status}`,
          response.status
        );
      }

      const data: SecApiResponse = await response.json();

      const reports = data?.hits?.hits || [];

      return reports;
    } catch (error) {
      logger.error("Error fetching data from SEC API:", error);
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(
          "An unexpected error occurred while contacting the SEC API",
          500,
          error
        );
      }
    }
  }
}

export type SecApiClientType = typeof secApiClient;

export const secApiClient = new SecApiClient();
