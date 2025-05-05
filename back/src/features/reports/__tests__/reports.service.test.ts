import { ReportsService } from "../service";
import { secApiClient } from "../../../shared/sec.client";
import { SecReportHit, ReportComparisonResult } from "../types";
import { ApiError } from "../../../shared/errors/api-error";

const mockFetchReports = jest.fn();
jest.mock("../../../shared/sec.client", () => ({
  secApiClient: {
    fetchLatestReports: (...args: any[]) => mockFetchReports(...args),
  },
}));

const createMockReport = (
  form: string,
  fileDate: string,
  adshSuffix: string
): SecReportHit => ({
  _index: "edgar_file",
  _id: `id-${adshSuffix}`,
  _score: null,
  _source: {
    ciks: ["0000789019"],
    file_date: fileDate,
    form: form,
    root_forms: [form],
    adsh: `0000950170-24-${adshSuffix}`,
    period_ending: fileDate.substring(0, 7) + "-01",
  },
  sort: [new Date(fileDate).getTime()],
});

// test scenarios
const reportK_2024 = createMockReport("10-K", "2024-07-30", "k2024");
const reportQ3_2024 = createMockReport("10-Q", "2024-10-30", "q32024"); // Q3 after K
const reportQ4_2024 = createMockReport("10-Q", "2025-01-29", "q42024"); // Q4 after Q3
const reportK_2023 = createMockReport("10-K", "2023-07-27", "k2023");
const reportQ1_2024 = createMockReport("10-Q", "2024-04-25", "q12024"); // Q1 (after K of 2023)
const reportQ2_2024 = createMockReport("10-Q", "2024-07-29", "q22024"); // Q2 (just before K 2024) - limit
const reportQ3_2023 = createMockReport("10-Q", "2023-10-24", "q32023"); // Q3 before  K 2023

describe("ReportsService", () => {
  let reportsService: ReportsService;

  beforeEach(() => {
    reportsService = new ReportsService({ secApiClient });
    mockFetchReports.mockClear();
  });

  it("should throw ApiError if no reports are found for CIK", async () => {
    const testCik = "0000000000";
    mockFetchReports.mockResolvedValueOnce([]);

    await expect(reportsService.findComparisonPair(testCik)).rejects.toThrow(
      new ApiError(`No reports found for CIK ${testCik}`, 404)
    );

    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should throw ApiError if SEC API client fails", async () => {
    const testCik = "0000111111";
    const errorMessage = "SEC API unavailable";
    mockFetchReports.mockRejectedValueOnce(new ApiError(errorMessage, 503));

    await expect(reportsService.findComparisonPair(testCik)).rejects.toThrow(
      new ApiError(errorMessage, 503)
    );

    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should compare latest 10-K with previous 10-K", async () => {
    const testCik = "111";
    // const mockReports = [
    //   reportQ4_2024,
    //   reportQ3_2024,
    //   reportK_2024,
    //   reportQ2_2024,
    //   reportQ1_2024,
    //   reportK_2023,
    //   reportQ3_2023,
    // ];
    // mockFetchReports.mockResolvedValueOnce(mockReports);

    const latestKScenario = [
      reportK_2024,
      reportQ2_2024,
      reportQ1_2024,
      reportK_2023,
      reportQ3_2023,
    ];
    mockFetchReports.mockResolvedValueOnce(latestKScenario);

    const result = await reportsService.findComparisonPair(testCik);

    expect(result.latestReport.accessionNumber).toBe(reportK_2024._source.adsh);
    expect(result.latestReport.formType).toBe("10-K");
    expect(result.previousReport.accessionNumber).toBe(
      reportK_2023._source.adsh
    );
    expect(result.previousReport.formType).toBe("10-K");
    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should compare latest 10-Q (non-Q1) with previous 10-Q", async () => {
    const testCik = "222";

    const mockReports = [
      reportQ4_2024,
      reportQ3_2024,
      reportK_2024,
      reportQ2_2024,
      reportQ1_2024,
      reportK_2023,
      reportQ3_2023,
    ];
    mockFetchReports.mockResolvedValueOnce(mockReports);

    const result = await reportsService.findComparisonPair(testCik);

    expect(result.latestReport.accessionNumber).toBe(
      reportQ4_2024._source.adsh
    );
    expect(result.latestReport.formType).toBe("10-Q");
    expect(result.previousReport.accessionNumber).toBe(
      reportQ3_2024._source.adsh
    );
    expect(result.previousReport.formType).toBe("10-Q");
    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should compare latest 10-Q (Q1 scenario) with previous 10-K", async () => {
    const testCik = "333";
    const mockReports = [reportQ1_2024, reportK_2023, reportQ3_2023];
    mockFetchReports.mockResolvedValueOnce(mockReports);

    const result = await reportsService.findComparisonPair(testCik);

    expect(result.latestReport.accessionNumber).toBe(
      reportQ1_2024._source.adsh
    );
    expect(result.latestReport.formType).toBe("10-Q");
    expect(result.previousReport.accessionNumber).toBe(
      reportK_2023._source.adsh
    );
    expect(result.previousReport.formType).toBe("10-K");
    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should compare 10-Q with previous 10-K if the K is more recent than the last Q before it", async () => {
    const testCik = "444";

    const reportQ2_2024_late = createMockReport("10-Q", "2024-07-29", "q2late");
    const reportQ1_2024_mid = createMockReport("10-Q", "2024-04-25", "q1mid");
    const reportK_2023_early = createMockReport(
      "10-K",
      "2023-07-27",
      "k2023early"
    );

    const mockReports = [
      reportQ2_2024_late,
      reportQ1_2024_mid,
      reportK_2023_early,
    ];
    mockFetchReports.mockResolvedValueOnce(mockReports);

    const result = await reportsService.findComparisonPair(testCik);

    // Latest: Q2 2024.
    // Previous K: K 2023 (2023-07-27)
    // Previous Q: Q1 2024 (2024-04-25)
    expect(result.latestReport.accessionNumber).toBe(
      reportQ2_2024_late._source.adsh
    );
    expect(result.latestReport.formType).toBe("10-Q");
    expect(result.previousReport.accessionNumber).toBe(
      reportQ1_2024_mid._source.adsh
    );
    expect(result.previousReport.formType).toBe("10-Q");
    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should throw ApiError if only one report is found", async () => {
    const testCik = "555";
    mockFetchReports.mockResolvedValueOnce([reportK_2024]);

    await expect(reportsService.findComparisonPair(testCik)).rejects.toThrow(
      ApiError
    );

    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should throw ApiError if latest is 10-K but no previous 10-K is found", async () => {
    const testCik = "666";
    const mockReports = [reportK_2024, reportQ3_2024, reportQ2_2024];
    mockFetchReports.mockResolvedValueOnce(mockReports);

    await expect(
      reportsService.findComparisonPair(testCik)
    ).rejects.toHaveProperty(
      "message",
      `Could not find a suitable previous report to compare with 10-K (${reportK_2024._source.adsh}) for CIK ${testCik}`
    );

    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });

  it("should throw ApiError if latest is 10-Q but no previous 10-K or 10-Q is found", async () => {
    const testCik = "777";
    const mockReports = [reportQ3_2024];
    mockFetchReports.mockResolvedValueOnce(mockReports);

    await expect(
      reportsService.findComparisonPair(testCik)
    ).rejects.toHaveProperty(
      "message",
      `Could not find a suitable previous report to compare with 10-Q (${reportQ3_2024._source.adsh}) for CIK ${testCik}`
    );

    expect(mockFetchReports).toHaveBeenCalledWith({ cik: testCik });
  });
});
