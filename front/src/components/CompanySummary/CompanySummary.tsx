import type { Company } from "../../types/company";
import type { ReportComparisonData } from "../../types";
import styles from "./CompanySummary.module.css";
import { formatDate } from "../../utils/formatDate";

type CompanySummaryProps = {
  company: Company;
  reportsData: ReportComparisonData;
};

export const PlaceholderLogoComponent = () => <div>LOGO</div>;

export const CompanySummary = ({
  company,
  reportsData,
}: CompanySummaryProps) => {
  if (!reportsData.latestReport || !reportsData.previousReport) {
    return <></>;
  }
  const { latestReport, previousReport } = reportsData;
  const latestDateFormatted = formatDate(latestReport.filingDate);
  const previousDateFormatted = formatDate(previousReport.filingDate);
  const previousReportQualifier = previousReport.reportType
    ? `(${previousReport.reportType})`
    : "";

  if (!company) {
    return null;
  }

  const logoSrc = company.logo;
  return (
    <div className={styles.summaryCard}>
      <div className={styles.logoSection}>
        <img
          key={logoSrc}
          src={logoSrc}
          alt={`${company.name} Logo`}
          className={styles.logo}
        />
      </div>
      <div className={styles.infoSection}>
        <h2 className={styles.companyName}>{company.name}</h2>
        <p className={styles.reportInfo}>
          <span className={styles.reportLabel}>Latest:</span>{" "}
          {latestDateFormatted}
        </p>
        <p className={styles.reportInfo}>
          <span className={styles.reportLabel}>Previous:</span>{" "}
          {previousDateFormatted} {previousReportQualifier}
        </p>
      </div>
      <div className={styles.cikSection}>
        <span className={styles.cikLabel}>CIK:</span>
        <span className={styles.cikValue}>{company.cik}</span>
      </div>
    </div>
  );
};
