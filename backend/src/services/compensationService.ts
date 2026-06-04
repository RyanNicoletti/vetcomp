import { ICompensation } from "../../../shared-types/types";
import { b2Client } from "../../config/b2Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Knex } from "knex";
import { SalaryFilter } from "../types";
import b2Service from "./b2Service";

const salariesService = {
  getAll: async (db: Knex) => {
    const compensations = await db("salaries")
      .select("*")
      .where({ is_approved: true });
    return compensations;
  },

  getAllPaginated: async (db: Knex, salaryFilter: SalaryFilter) => {
    const query = db<ICompensation>("salaries").select(
      "*",
      db.raw("COUNT(*) OVER() AS total_count")
    );

    if (salaryFilter.companySearch) {
      query.whereILike("company", `%${salaryFilter.companySearch}%`);
    }
    if (salaryFilter.locationSearch) {
      query.whereILike("location", `%${salaryFilter.locationSearch}%`);
    }

    if (salaryFilter.specialistsOnly) {
      query.where("is_specialist", true);
    } else if (
      salaryFilter.practiceTypeFilter &&
      salaryFilter.practiceTypeFilter.length > 0
    ) {
      query.where(function () {
        for (const practiceType of salaryFilter.practiceTypeFilter!) {
          this.orWhereLike("type_of_practice", `%${practiceType}%`);
        }
      });
    }

    salaryFilter.isAdminQuery
      ? query.where((q) =>
          q.where({ is_approved: false }).orWhere({ needs_review: true })
        )
      : query.where({ is_approved: true });

    if (salaryFilter.sortBy) {
      query.orderBy(salaryFilter.sortBy, salaryFilter.sortDirection, "last");
    } else {
      query.orderBy("created_at", "desc");
    }

    const offset = salaryFilter.page * salaryFilter.rowsPerPage;
    query.offset(offset).limit(salaryFilter.rowsPerPage);

    const compensations = await query;

    const total =
      compensations.length > 0 ? Number(compensations[0].total_count) : 0;
    const pages = Math.ceil(total / salaryFilter.rowsPerPage);

    if (salaryFilter.isAdminQuery) {
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
    }

    return { compensations, pages };
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
  approveById: async (
    db: Knex,
    compId: string
  ): Promise<ICompensation | null> => {
    const [updatedComp] = await db("salaries")
      .where({ id: compId })
      .update({ is_approved: true })
      .returning("*");
    return updatedComp || null;
  },
  verifyById: async (
    knex: Knex,
    compId: string
  ): Promise<ICompensation | null> => {
    const [updatedComp] = await knex("salaries")
      .where({ id: compId })
      .update({ is_verified: true, needs_review: false })
      .returning("*");

    return updatedComp || null;
  },

  getByIdAndUserId: async (
    db: Knex,
    compId: string,
    userId: string
  ): Promise<ICompensation | null> => {
    const comp = await db<ICompensation>("salaries")
      .where({ id: compId, user_id: userId })
      .first();
    return comp || null;
  },

  updateById: async (
    knex: Knex,
    compId: string,
    userId: string,
    updateData: Partial<ICompensation>
  ): Promise<ICompensation | null> => {
    let totalCompensation;
    if (updateData.base_salary && !updateData.average_annual_production) {
      totalCompensation = updateData.base_salary;
    }
    if (updateData.base_salary && updateData.average_annual_production) {
      totalCompensation =
        updateData.base_salary + updateData.average_annual_production;
    }

    const dataWithTotal = {
      ...updateData,
      total_compensation: totalCompensation ?? null,
      is_approved: false,
    };

    const [updatedComp] = await knex<ICompensation>("salaries")
      .where({ id: compId, user_id: userId })
      .update(dataWithTotal)
      .returning("*");

    return updatedComp || null;
  },

  deleteById: async (knex: Knex, compId: string): Promise<boolean> => {
    const deletedCount = await knex("salaries").where({ id: compId }).del();

    return deletedCount > 0;
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
        verification_document_name: verificationDocumentKey,
        verification_document_original_name: verificationDocumentName,
        needs_review: true,
      })
      .returning("*");

    return updatedCompensation[0] || null;
  },
};

export default salariesService;
