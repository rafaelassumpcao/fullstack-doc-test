import { Request, Response } from "express";
import { CompanyService } from "./service";
import logger from "@/config/logger";
import { ApiError } from "@/shared/errors/api-error";

export class CompanyController {
  private companyService: CompanyService;

  constructor(service: CompanyService) {
    this.companyService = service;
    this.listCompanies = this.listCompanies.bind(this);
  }

  async listCompanies(_req: Request, res: Response): Promise<void> {
    logger.info("Fetching all companies");
    const companies = await this.companyService.getAllCompanies();
    if (!companies || companies.length === 0) {
      throw new ApiError("No companies found", 404);
    }
    res.status(200).json(companies);
  }
}
