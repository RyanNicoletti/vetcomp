import "dotenv/config";
import knexConfig from "../../config/knexfile";
import knex from "knex";

const env: string = process.env.NODE_ENV!;
export const db = knex(knexConfig[env]);
