import { useState, useEffect, useRef } from "react";
import { fetchCompanies } from "../services";
import type { Company } from "../types/company";

export function useDebouncedSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, Company[]>>(new Map());

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery === "" || query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (cacheRef.current.has(trimmedQuery)) {
      const cachedResults = cacheRef.current.get(trimmedQuery)!;
      setSuggestions(cachedResults);
      setIsLoading(false);
      setError(null);
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await fetchCompanies(query);
        setSuggestions(results);
      } catch (err) {
        console.error("failed to search suggestions:", err);
        setError("Failed to fetch suggestions.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  return { suggestions, isLoading, error };
}
