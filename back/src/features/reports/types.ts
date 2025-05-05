export type SecReportHitSource = {
  ciks: string[];
  period_ending?: string;
  file_date: string;
  form: string;
  root_forms?: string[];
  adsh: string; // Accession Number unique identifier
  display_names?: string[];
};

export type SecReportHit = {
  _index: string;
  _id: string;
  _score: number | null;
  _source: SecReportHitSource;
  sort?: number[];
};

export type SecApiResponse = {
  took: number;
  timed_out: boolean;
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number | null;
    hits: SecReportHit[];
  };
};

export type ReportData = {
  accessionNumber: string;
  formType: string;
  fileDate: string;
  periodEnding?: string;
  cik: string;
  url: string;
};

export type ReportComparisonResult = {
  latestReport: ReportData;
  previousReport: ReportData;
};

export type Report = "Annual" | "Q1" | "Q2" | "Q3";
