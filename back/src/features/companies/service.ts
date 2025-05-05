import { Company, Repository } from "./types";

export class CompanyService {
  private companyRepository: Repository<Company>;

  constructor(repository: Repository<Company>) {
    this.companyRepository = repository;
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}
