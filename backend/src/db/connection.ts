import knexConfig from "../../config/knexfile";
import knex from "knex";

const env: string = process.env.NODE_ENV || "development";
export const db = knex(knexConfig[env]);
