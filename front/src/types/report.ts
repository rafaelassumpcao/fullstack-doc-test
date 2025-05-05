export type ReportData = {
  filingDate: string;
  reportType?: ReportType;
  formType: string;
  periodEnding: string;
  cik: string;
  accessionNumber: string;
  url: string;
  fileDate: string;
};

export type ReportComparisonData = {
  latestReport: ReportData;
  previousReport: ReportData;
};

export type ReportType = "Annual" | "Q1" | "Q2" | "Q3" | string;
