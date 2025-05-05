import { useState, useEffect } from "react";
import { fetchReportComparison } from "../services/reportService";
import type { ReportComparisonData } from "../types";

const wrapUrlQuerystring = (url: string) => `http://localhost:3010${url}`;

export function useReportComparison(cik: string | null | undefined) {
  const [reportData, setReportData] = useState<ReportComparisonData | null>(
    null
  );

  console.log(JSON.stringify(reportData, null, 2));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cik) {
      setReportData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setReportData(null);
      setError(null);
      setIsLoading(true);

      try {
        const data = await fetchReportComparison(cik);
        if (!data) {
          setError("No data found for the given CIK.");
        } else {
          data.latestReport.url = wrapUrlQuerystring(data.latestReport.url);
          data.previousReport.url = wrapUrlQuerystring(data.previousReport.url);
          setReportData(data);
        }
      } catch (err) {
        console.error("[useReportComparison] Failed to load reports:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching reports.";
        setError(errorMessage);
        setReportData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cik]);

  return { reportData, isLoading, error };
}
