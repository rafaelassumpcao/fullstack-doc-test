export type Company = {
  cik: string;
  name: string;
  ticker: string | null;
  logo: string | null;
};

export type Repository<T> = {
  findAll: () => Promise<T[]>;
};
