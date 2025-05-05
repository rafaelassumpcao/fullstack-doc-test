import { Company } from "../types";
import { API_BASE_URL } from "../utils/constants";

export const fetchCompanies = async (query: string): Promise<Company[]> => {
  const trimmedQuery = query.trim();
  console.log(
    `[ReportService] Searching Companies on API for query: "${trimmedQuery}"`
  );

  if (trimmedQuery.length < 2) {
    console.log(
      "[ReportService] Debounce: Query too short, returning empty array."
    );
    return [];
  }

  const url = `${API_BASE_URL}/companies`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `[ReportService] Failed to get companies: ${response.status} ${response.statusText}`
      );
      throw new Error(`Failed to get companies (${response.status})`);
    }
    const results: Company[] = await response.json();

    console.log(
      `[ReportService] Received ${results.length} companies from API`
    );
    return results;
  } catch (error) {
    console.error("[ReportService] Failed to fetch:", error);
    return [];
  }
};
