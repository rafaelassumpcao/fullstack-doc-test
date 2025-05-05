import { Request, Response, NextFunction } from "express";
import { ReportsService } from "./service";
import logger from "@/config/logger";

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {
    this.reportsService = reportsService;
    this.compareReports = this.compareReports.bind(this);
    this.streamSecReport = this.streamSecReport.bind(this);
  }

  async compareReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { cik } = req.params;
    try {
      const result = await this.reportsService.findComparisonPair(cik);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async streamSecReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // TODO: validate query
    const url = req.query.url as string;

    if (!url) {
      return next(new Error("The 'url' query parameter is required."));
    }

    try {
      const { stream, headers } = await this.reportsService.streamSecReport(
        url
      );

      res.writeHead(200, headers);

      stream.pipe(res);

      stream.on("error", (streamError) => {
        logger.error("Error during SEC report stream pipe:", streamError);

        if (!res.headersSent) {
          next(streamError);
        } else {
          res.end();
        }
      });

      stream.on("end", () => {
        logger.info(`Successfully streamed SEC report from: ${url}`);
      });
    } catch (error) {
      next(error);
    }
  }
}
