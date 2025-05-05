import { Router } from "express";
import { ReportsController } from "./controller";
import { ReportsService } from "./service";
import { validateRequest } from "@/shared/middleware/input-validator";
import { compareReportsParamsSchema } from "./validators";
import { secApiClient } from "@/shared/sec.client";

const reportsRouter = Router();

const reportsService = new ReportsService({
  secApiClient: secApiClient,
});

const reportsController = new ReportsController(reportsService);

/**
 * @swagger
 * /reports/compare/{cik}:
 *   get:
 *     summary: Compare reports for a given CIK
 *     parameters:
 *       - name: cik
 *         in: path
 *         required: true
 *         description: The CIK to compare reports for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comparison result
 *       400:
 *         description: Invalid CIK parameter
 */
reportsRouter.get(
  "/compare/:cik",
  validateRequest(compareReportsParamsSchema),
  reportsController.compareReports
);

// TODO: Add Swagger documentation for this endpoint
reportsRouter.get("/report-sec", reportsController.streamSecReport);

export { reportsRouter };
