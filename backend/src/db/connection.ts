import "dotenv/config";
import knexConfig from "../../knexfile";
import knex from "knex";

const env = process.env.NODE_ENV || "development";
const knexInstance = knex(knexConfig[env]);
export default knexInstance;
