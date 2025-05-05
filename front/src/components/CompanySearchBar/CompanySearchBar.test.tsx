import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanySearchBar } from "./CompanySearchBar";
import type { Company } from "../../types/company";

vi.mock("./CompanySearchBar", async (importOriginal) => {
  const originalModule = await importOriginal<
    typeof import("./CompanySearchBar")
  >();
  return {
    ...originalModule,
  };
});

const mockCompanies: Company[] = [
  {
    id: "1",
    cik: "0000320193",
    name: "Apple Inc. (AAPL)",
    logo: "",
  },
  {
    id: "2",
    cik: "0001652044",
    name: "Alphabet Inc. (GOOGL)",
    logo: "",
  },
];

describe("CompanySearchBar Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  const onCompanySelectMock = vi.fn();

  beforeEach(() => {
    user = userEvent.setup({ delay: null });
    vi.useFakeTimers();
    onCompanySelectMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the input field", () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);
    expect(input).toBeInTheDocument();
  });

  it("updates query state on input change", async () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);
    await user.type(input, "Appl");
    expect(input).toHaveValue("Appl");
  });

  it("does not show suggestions for short queries", async () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);
    await user.type(input, "A");
    vi.advanceTimersByTime(500);
    const list = screen.queryByRole("listbox");
    expect(list).not.toBeInTheDocument();
  });

  it("shows suggestions after typing and debounce", async () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);

    await user.type(input, "Apple");
    expect(input).toHaveValue("Apple");

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText(/Apple Inc./i)).toBeInTheDocument();
    });
  });

  it('shows "no results" when fetch returns empty array', async () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);
    await user.type(input, "NonExistent");
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText(/No Company Found/i)).toBeInTheDocument();
    });
  });

  it("calls onCompanySelect when a suggestion is clicked", async () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);
    await user.type(input, "App");
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(async () => {
      const suggestionItem = screen.getByText(/Apple Inc./i);
      await user.click(suggestionItem);
    });

    expect(onCompanySelectMock).toHaveBeenCalledTimes(1);
    expect(onCompanySelectMock).toHaveBeenCalledWith(mockCompanies[0]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("Apple Inc. (AAPL)");
  });

  it("hides suggestions when Escape key is pressed", async () => {
    render(<CompanySearchBar onCompanySelect={onCompanySelectMock} />);
    const input = screen.getByPlaceholderText(/Search Company/i);
    await user.type(input, "App");
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Lista deve sumir
    });
  });
});
