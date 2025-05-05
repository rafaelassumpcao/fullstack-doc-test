import type { Knex } from "knex";

const rawCompanyData = [
  {
    id: "1",
    cik: "0000320193",
    name: "Apple Inc. (AAPL)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    id: "2",
    cik: "0001652044",
    name: "Alphabet Inc. (GOOGL)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Alphabet_Inc_Logo_2015.svg",
  },
  {
    id: "3",
    cik: "0000789019",
    name: "Microsoft Corporation (MSFT)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  },
  {
    id: "4",
    cik: "0001018724",
    name: "Amazon.com, Inc. (AMZN)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
  },
  {
    id: "5",
    cik: "0001326801",
    name: "Meta Platforms, Inc. (META)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo_%28cropped%29.svg",
  },
  {
    id: "6",
    cik: "0001318605",
    name: "Tesla (TSLA)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg",
  },
  {
    id: "7",
    cik: "0001065280",
    name: "Netflix (NFLX)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg",
  },
];

export async function seed(knex: Knex): Promise<void> {
  await knex("companies").del();
  const companiesToInsert = rawCompanyData.map((company) => {
    let name = company.name;
    let ticker = null;

    const tickerMatch = name.match(/\s*\(([^)]+)\)$/);

    if (tickerMatch && tickerMatch[1]) {
      ticker = tickerMatch[1];
      name = name.replace(/\s*\([^)]+\)$/, "").trim();
    } else {
      const simpleTickerMatch = name.match(/\(([^)]+)\)$/);
      if (simpleTickerMatch && simpleTickerMatch[1]) {
        ticker = simpleTickerMatch[1];
        name = name.replace(/\(([^)]+)\)$/, "").trim();
      }
    }

    return {
      cik: company.cik,
      name: name,
      ticker: ticker,
      logo: company.logo,
    };
  });

  await knex("companies").insert(companiesToInsert);

  console.log(`Successfully seeded ${companiesToInsert.length} companies.`);
}
