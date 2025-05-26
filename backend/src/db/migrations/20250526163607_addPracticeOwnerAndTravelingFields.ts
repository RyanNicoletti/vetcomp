import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("salaries", (table) => {
    table.boolean("is_practice_owner").defaultTo(false);
    table.text("practice_description").nullable();
    table.boolean("is_traveling").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("salaries", (table) => {
    table.dropColumn("is_practice_owner");
    table.dropColumn("practice_description");
    table.dropColumn("is_traveling");
  });
}
