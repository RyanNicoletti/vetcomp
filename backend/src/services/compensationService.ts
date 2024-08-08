import knex from "../db/connection";
import { ICompensation } from "../../../shared-types/types";

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
};

export default salariesService;
