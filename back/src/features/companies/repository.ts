import type { Knex } from "knex";
import { Company } from "./types";

export class CompanyRepository {
  private db: Knex;

  constructor(knexInstance: Knex) {
    this.db = knexInstance;
  }

  async findAll(): Promise<Company[]> {
    const companies = await this.db("companies").select("*");
    return companies;
  }
}
