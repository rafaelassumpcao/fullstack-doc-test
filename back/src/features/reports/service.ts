import logger from "@/config/logger";
import {
  SecReportHit,
  ReportData,
  ReportComparisonResult,
  Report,
} from "./types";
import { ApiError } from "@/shared/errors/api-error";
import { SecApiClientType } from "@/shared/sec.client";
import { PassThrough, Readable } from "stream";

type ReportServiceDependencies = {
  secApiClient: SecApiClientType;
};

export class ReportsService {
  private readonly secApiClient: SecApiClientType;

  private readonly headersToRemove = [
    "content-security-policy",
    "cross-origin-opener-policy",
    "cross-origin-embedder-policy",
    "cross-origin-resource-policy",
    "x-frame-options",
    "x-content-type-options",
  ];

  constructor(private readonly dependencies: ReportServiceDependencies) {
    this.secApiClient = this.dependencies.secApiClient;
  }

  async findComparisonPair(cik: string): Promise<ReportComparisonResult> {
    let [latestReportHit, ...previousReportsHit] =
      await this.secApiClient.fetchLatestReports({ cik });

    if (!latestReportHit) {
      throw new ApiError(`No reports found for CIK ${cik}`, 404);
    }

    const latestReport = this.mapToReportData(latestReportHit);
    let previousReports: ReportData[] = previousReportsHit.map((hit) =>
      this.mapToReportData(hit)
    );

    const previousReport = this.getPreviousReport(
      latestReport,
      previousReports
    );

    if (!previousReport) {
      throw new ApiError(
        `Could not find a suitable previous report to compare with ${latestReport.formType} (${latestReport.accessionNumber}) for CIK ${cik}`,
        404
      );
    }

    return {
      latestReport,
      previousReport,
    };
  }

  private mapToReportData(reportHit: SecReportHit): ReportData {
    const [adsh, fileName] = reportHit._id?.split(":");
    const accesionNumber = adsh.replace(/-/g, "");
    return {
      accessionNumber: reportHit._source.adsh,
      formType: reportHit._source.form,
      fileDate: reportHit._source.file_date,
      periodEnding: reportHit._source.period_ending,
      cik: reportHit._source.ciks[0],
      url: `/api/reports/report-sec?url=${encodeURIComponent(
        `https://www.sec.gov/Archives/edgar/data/${reportHit._source.ciks[0]}/${accesionNumber}/${fileName}`
      )}`,
    };
  }

  private getPreviousReport = (
    latest: ReportData,
    previousReports: ReportData[] = []
  ): ReportData | undefined => {
    const isAnualReport = latest.formType === "10-K";
    if (isAnualReport) {
      const previousK = previousReports.find(
        (report) => report.formType === "10-K"
      );
      return previousK;
    }

    const isQ1Report =
      latest.formType === "10-Q" && previousReports[0]?.formType === "10-K";

    if (isQ1Report) {
      return previousReports[0];
    }
    // with latest being a Q3 or Q2 always compare with Q prev
    return previousReports[0];
  };

  async streamSecReport(reportUrl: string): Promise<{
    stream: NodeJS.ReadableStream;
    headers: Record<string, string>;
  }> {
    logger.info(`Proxying request to SEC URL: ${reportUrl}`);

    const nodeStream = new PassThrough();

    fetch(reportUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          process.env.SEC_API_USER_AGENT || "SeuApp Nome Contato@email.com",
      },
    })
      .then((response) => {
        if (!response.ok) {
          logger.error(
            `Failed to fetch SEC report from ${reportUrl}. Status: ${response.status} ${response.statusText}`
          );

          nodeStream.emit(
            "error",
            new ApiError(
              `Failed to fetch report from SEC. Status: ${response.status}`,
              response.status === 404 ? 404 : 502
            )
          );
          return;
        }

        if (!response.body) {
          nodeStream.emit(
            "error",
            new ApiError("Received empty response body from SEC", 502)
          );
          return;
        }

        const filteredHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          const lowerKey = key.toLowerCase();
          if (!this.headersToRemove.includes(lowerKey)) {
            filteredHeaders[key] = value;
          } else {
            logger.debug(`Removing header: ${key}`);
          }
        });

        nodeStream.emit("headers", filteredHeaders);

        (async () => {
          try {
            if (!response.body) {
              throw new ApiError("Received empty response body from SEC", 502);
            }
            for await (const chunk of response.body) {
              nodeStream.write(chunk);
            }

            nodeStream.end();
            logger.debug(`Finished streaming data from ${reportUrl}`);
          } catch (streamError) {
            logger.error(
              `Error reading stream from ${reportUrl}:`,
              streamError
            );
            nodeStream.emit(
              "error",
              new ApiError("Error reading SEC report stream", 500, streamError)
            );
          }
        })();
      })
      .catch((fetchError) => {
        logger.error(
          `Workspace connection error for ${reportUrl}:`,
          fetchError
        );
        nodeStream.emit(
          "error",
          new ApiError(
            `Failed to connect to the SEC URL: ${
              fetchError.message || "Unknown fetch error"
            }`,
            502
          )
        );
      });

    return { stream: nodeStream, headers: {} };
  }
}
