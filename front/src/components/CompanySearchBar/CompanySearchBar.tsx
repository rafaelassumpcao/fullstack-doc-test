import { useState, Fragment } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  Transition,
} from "@headlessui/react";
import type { Company } from "../../types/company";
import styles from "./CompanySearchBar.module.css";
import { useDebouncedSuggestions } from "../../hooks/useDebouncedSuggestions";

type CompanySearchBarProps = {
  onCompanySelect: (company: Company | null) => void;
};

export const CompanySearchBar = ({
  onCompanySelect,
}: CompanySearchBarProps) => {
  const [query, setQuery] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<Company | null>(null);

  const { suggestions, isLoading, error } = useDebouncedSuggestions(query);

  const filteredSuggestions = suggestions.filter(
    (company: { name: string; cik: string | string[] }) =>
      company.name.toLowerCase().includes(query.toLowerCase()) ||
      company.cik.includes(query)
  );

  const handleSelectionChange = (company: Company | null) => {
    setSelectedValue(company);
    onCompanySelect(company);
  };

  return (
    <div className={styles.searchContainer}>
      <Combobox value={selectedValue} onChange={handleSelectionChange}>
        <div className={styles.comboboxWrapper}>
          <ComboboxInput
            id="company-search-input"
            className={styles.searchInput}
            displayValue={(company: Company | null) => company?.name || query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company by ticker, name, or CIK ..."
            aria-label="Search Company"
            autoComplete="off"
          />
          <ComboboxButton className={styles.comboboxButton}>
            <span aria-hidden="true">▼</span>
          </ComboboxButton>
        </div>
        <Transition
          as={Fragment}
          leave={styles.transitionLeave}
          leaveFrom={styles.transitionLeaveFrom}
          leaveTo={styles.transitionLeaveTo}
          afterLeave={() => setQuery("")}
        >
          <ComboboxOptions className={styles.suggestionsList}>
            {isLoading && <div className={styles.loadingItem}>Loading...</div>}
            {error && <div className={styles.errorItem}>{error}</div>}

            {!isLoading &&
              !error &&
              query.trim() !== "" &&
              suggestions.length === 0 && (
                <div className={styles.noResultsItem}>
                  No Company found for query: "{query}".
                </div>
              )}

            {!isLoading &&
              !error &&
              filteredSuggestions.map((company) => (
                <ComboboxOption
                  key={company.id}
                  value={company}
                  className={({ active }) =>
                    `${styles.suggestionItem} ${
                      active ? styles.activeSuggestion : ""
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`${styles.suggestionName} ${
                          selected ? styles.selectedSuggestionName : ""
                        }`}
                      >
                        {company.name}
                      </span>
                      <span className={styles.cik}>{company.cik}</span>
                      {selected ? (
                        <span
                          className={`${styles.checkmark} ${
                            active ? styles.activeCheckmark : ""
                          }`}
                        >
                          ✓
                        </span>
                      ) : null}
                    </>
                  )}
                </ComboboxOption>
              ))}
          </ComboboxOptions>
        </Transition>
      </Combobox>
    </div>
  );
};
