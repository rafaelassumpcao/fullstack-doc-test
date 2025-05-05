import type { Company } from "../../types/company";
import styles from "./CompanySearchBar.module.css";

type CompanySuggestionItemProps = {
  company: Company;
  isActive: boolean;
  onClick: (company: Company) => void;
};

export const CompanySuggestionItem = ({
  company,
  isActive,
  onClick,
}: CompanySuggestionItemProps) => {
  const handleClick = () => {
    onClick(company);
  };

  const itemClasses = `${styles.suggestionItem} ${
    isActive ? styles.activeSuggestion : ""
  }`;

  return (
    <li
      key={company.cik}
      className={itemClasses}
      onClick={handleClick}
      role="option"
      aria-selected={isActive}
    >
      <span>{company.name}</span>
      <span className={styles.cik}>{company.cik}</span>
    </li>
  );
};
