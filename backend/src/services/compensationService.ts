import { ICompensation } from "../../../shared-types/types";
import { b2Client } from "../../config/b2Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Knex } from "knex";
import { SalaryFilter } from "../types";

const salariesService = {
  getAll: async (db: Knex, salaryFilter: SalaryFilter) => {
    let query = db<ICompensation>("salaries").select("*");

    if (salaryFilter.sortBy) {
      query = query.orderBy(
        salaryFilter.sortBy,
        salaryFilter.sortDirection,
        "last"
      );
    }

    const offset: number = salaryFilter.page * salaryFilter.rowsPerPage;
    query = query.offset(offset).limit(salaryFilter.rowsPerPage);

    query = query.where({ is_approved: salaryFilter.getApprovedCompensations });

    const compensations: ICompensation[] = await query;

    const [{ count }] = await db("salaries")
      .count("* as count")
      .where({ is_approved: salaryFilter.getApprovedCompensations });

    const total: number = Number(count);
    const pages: number = Math.ceil(total / salaryFilter.rowsPerPage);

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
  create: async (knex: Knex, newCompensation: Partial<ICompensation>) => {
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
  approveById: async (knex: Knex, compId: string): Promise<void> => {
    try {
      await knex("salaries").where({ id: compId }).update("is_approved", true);
    } catch (err) {
      throw new Error("Failed to approve comp in compensation service");
    }
  },
  verifyById: async (knex: Knex, compId: string): Promise<void> => {
    try {
      await knex("salaries").where({ id: compId }).update("is_verified", true);
    } catch (err) {
      throw new Error("Failed to verify comp in compensation service");
    }
  },
  deleteById: async (knex: Knex, compId: string): Promise<void> => {
    try {
      await knex("salaries").where({ id: compId }).del();
    } catch (err) {
      throw new Error("Failed to delete comp in compensation service");
    }
  },
};

export default salariesService;
