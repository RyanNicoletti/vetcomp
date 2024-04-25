import knex from "../db/connection";

const salariesService = {
  getAll() {
    return knex("salaries").select("*");
  },
};

export default salariesService;
