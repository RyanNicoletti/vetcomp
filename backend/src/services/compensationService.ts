import knex from "../db/connection";
import { ICompensation } from "../../../shared-types/types";
import { b2Client } from "../../config/b2Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

interface SalaryFilter {
  page: number;
  rowsPerPage: number;
  sortDirection: "asc" | "desc";
  sortBy?: string;
}

const salariesService = {
  getAll: async (salaryFilter: SalaryFilter) => {
    let salariesQueryBuilder = knex<ICompensation>("salaries").select("*");
    if (salaryFilter.sortBy !== "") {
      salariesQueryBuilder = salariesQueryBuilder.orderBy(
        salaryFilter.sortBy!,
        salaryFilter.sortDirection,
        "last"
      );
    }

    const offset: number = salaryFilter.page * salaryFilter.rowsPerPage;
    salariesQueryBuilder = salariesQueryBuilder
      .offset(offset)
      .limit(salaryFilter.rowsPerPage);

    const [{ totalSalaryCount }] = await knex("salaries").count(
      "* as totalSalaryCount"
    );
    const total: number = totalSalaryCount as number;
    const pages: number = Math.ceil(total / salaryFilter.rowsPerPage);

    const compensations: ICompensation[] = await salariesQueryBuilder;
    return { compensations, pages };
  },

  uploadFileToB2: async (
    fileBuffer: Buffer,
    fileName: string
  ): Promise<string | undefined> => {
    try {
      const uploadedFile = await b2Client.send(
        new PutObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: fileName,
          Body: fileBuffer,
        })
      );
      return uploadedFile.ETag;
    } catch (err) {
      console.error("upload file error: ", err);
      return undefined;
    }
  },
  create: async (newCompensation: ICompensation) => {
    try {
      let totalCompensation;
      if (
        newCompensation.base_salary &&
        !newCompensation.average_annual_production
      ) {
        totalCompensation = newCompensation.base_salary;
      }
      if (
        newCompensation.base_salary &&
        newCompensation.average_annual_production
      ) {
        totalCompensation =
          newCompensation.base_salary +
          newCompensation.average_annual_production;
      }

      const compensationWithTotal = {
        ...newCompensation,
        total_compensation: totalCompensation,
      };

      const [insertedCompensation] = await knex<ICompensation>("salaries")
        .insert(compensationWithTotal)
        .returning("*");

      return insertedCompensation;
    } catch (error) {
      console.error("Error creating compensation:", error);
      throw error;
    }
  },
};

export default salariesService;
