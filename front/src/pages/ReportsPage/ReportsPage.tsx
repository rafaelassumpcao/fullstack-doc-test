import React, { useState, useCallback, Suspense } from "react";
import type { Company } from "../../types/company";
import { CompanySearchBar } from "../../components/CompanySearchBar/CompanySearchBar";
import { CompanySummary } from "../../components/CompanySummary/CompanySummary";
import { useReportComparison } from "../../hooks/useReportComparison";
import styles from "./ReportsPage.module.css";

const CompanyReportDiff = React.lazy(() =>
  import("../../components/CompanyReportDiff/CompanyReportDiff").then(
    (module) => ({ default: module.CompanyReportDiff })
  )
);

export const ReportsPage = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { reportData, isLoading, error } = useReportComparison(
    selectedCompany?.cik
  );

  const handleCompanySelect = useCallback((company: Company | null) => {
    setSelectedCompany(company);
  }, []);

  return (
    <div className={styles.reportsPageContainer}>
      <h1>Company Reports</h1>

      <CompanySearchBar onCompanySelect={handleCompanySelect} />

      {isLoading && (
        <div className={styles.loadingIndicator}>Loading Reports ...</div>
      )}
      {error && <div className={styles.errorIndicator}>Error: {error}</div>}

      {selectedCompany && reportData && !isLoading && !error && (
        <CompanySummary company={selectedCompany} reportsData={reportData} />
      )}

      {reportData && selectedCompany?.cik && !isLoading && !error && (
        <Suspense
          fallback={
            <div className={styles.loadingIndicator}>Loading Diff View...</div>
          }
        >
          <CompanyReportDiff
            cik={selectedCompany.cik}
            reportsData={reportData}
          />
        </Suspense>
      )}
    </div>
  );
};
