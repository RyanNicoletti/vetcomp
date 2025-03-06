import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("salaries", (table) => {
    table.text("verification_document_original_name");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("salaries", (table) => {
    table.dropColumn("verification_document_original_name");
  });
}
