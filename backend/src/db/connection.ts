import "dotenv/config";
import knexConfig from "../../config/knexfile";
import knex from "knex";

const env: string = process.env.NODE_ENV!;
const knexInstance = knex(knexConfig[env]);
export default knexInstance;
