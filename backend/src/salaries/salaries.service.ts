import knex from "../db/connection";
import { SalaryFilter } from "./types";
import { Salary } from "../../../shared-types/types";

const salariesService = {
  getAll: async (salaryFilter: SalaryFilter) => {
    let salariesQueryBuilder = knex<Salary>("salaries").select("*");
    if (salaryFilter.sortBy !== "") {
      salariesQueryBuilder = salariesQueryBuilder.orderBy(
        salaryFilter.sortBy!,
        salaryFilter.sortDirection
      );
    }
    const offset = salaryFilter.page * salaryFilter.rowsPerPage;
    salariesQueryBuilder = salariesQueryBuilder
      .offset(offset)
      .limit(salaryFilter.rowsPerPage);

    const [{ totalSalaryCount }] = await knex("salaries").count(
      "* as totalSalaryCount"
    );
    const total: number = totalSalaryCount as number;
    const pages = Math.ceil(total / salaryFilter.rowsPerPage);

    const salaries = await salariesQueryBuilder;

    return { salaries, pages };
  },
};

export default salariesService;
