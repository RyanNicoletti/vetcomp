import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("salaries", (table) => {
    table.decimal("days_worked_per_week", 3, 1).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("salaries", (table) => {
    table.integer("days_worked_per_week").alter();
  });
}
