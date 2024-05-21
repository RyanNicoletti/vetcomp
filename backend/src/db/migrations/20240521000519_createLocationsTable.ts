import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("locations", (table) => {
    table.increments("id").primary();
    table.string("location", 255).notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("locations");
}
