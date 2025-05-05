import { ReportComparisonData } from "../types";
import { API_BASE_URL } from "../utils/constants";

export const fetchReportComparison = async (
  cik: string
): Promise<ReportComparisonData> => {
  if (!cik || typeof cik !== "string" || cik.trim() === "") {
    console.error("[ReportService] Invalid CIK provided:", cik);
    throw new Error("Invalid CIK provided.");
  }

  const url = `${API_BASE_URL}/reports/compare/${cik}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      let errorMessage = `Api Error - (${response.status}): failed to compare reports for CIK ${cik}.`;

      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;

      throw new Error(errorMessage);
    }

    const data: ReportComparisonData = await response.json();
    if (!data) {
      throw new Error("No data returned from API.");
    }

    return data;
  } catch (error) {
    throw new Error("Failed to fetch report comparison data: " + error);
  }
};
