import { ICompensation } from "../../../shared-types/types";
import { b2Client } from "../../config/b2Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Knex } from "knex";
import { SalaryFilter } from "../types";
import b2Service from "./b2Service";

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

    if (salaryFilter.getApprovedCompensations) {
      return { compensations, pages };
    }

    const compensationsWithDocuments = await Promise.all(
      compensations.map(async (comp) => {
        if (comp.verification_document_name) {
          comp.verification_document_url = await b2Service.getSignedUrl(
            comp.verification_document_name
          );
        }
        return comp;
      })
    );

    return { compensations: compensationsWithDocuments, pages };
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

  uploadVerificationDocument: async (
    db: Knex,
    compId: string,
    verificationDocumentKey: string,
    verificationDocumentName: string
  ): Promise<ICompensation | null> => {
    const updatedCompensation = await db("salaries")
      .where({ id: compId })
      .update({
        verification_document_url: verificationDocumentKey,
        verification_document_name: verificationDocumentName,
        is_approved: false,
      })
      .returning("*");

    return updatedCompensation[0] || null;
  },
};

export default salariesService;
