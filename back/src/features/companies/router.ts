// src/features/companies/router.ts
import { Router } from "express";
import { CompanyController } from "./controller";
import { CompanyService } from "./service";
import { CompanyRepository } from "./repository";
import dbConnection from "@/database/connection";

const companiesRouter = Router();

const companyRepository = new CompanyRepository(dbConnection);
const companyService = new CompanyService(companyRepository);
const companyController = new CompanyController(companyService);

/**
 * @swagger
 * /api/companies:
 * get:
 * summary: Retorna uma lista de todas as empresas.
 * tags: [Companies]
 * responses:
 * 200:
 * description: Uma lista de empresas.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * 500:
 * description: Erro interno do servidor.
 */
companiesRouter.get("/", companyController.listCompanies);

export { companiesRouter };
