import { ParsedQs } from "qs";
import knex from "../db/connection";
import { SalaryQueryParams } from "./types";

const salariesService = {
  getAll(queryParams: ParsedQs) {
    console.log(queryParams);
    return knex("salaries").select("*");
  },
};

export default salariesService;
