import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salaries", (table) => {
    table.increments("salary_id").primary();
    table.text("company");
    table.text("title");
    table.text("type_of_practice");
    table.boolean("is_new_grad");
    table.integer("years_of_experience");
    table.text("location");
    table.decimal("base_salary", 12, 2);
    table.decimal("hourly_rate", 12, 2);
    table.enu("payment_frequency", ["annually", "hourly"]);
    table.decimal("average_annual_bonus", 12, 2);
    table.decimal("sign_on_bonus", 12, 2);
    table.decimal("average_annual_production", 12, 2);
    table.integer("percent_production");
    table.decimal("total_compensation", 12, 2);
    table.enu("gender", ["male", "female", "non-binary"]);
    table.integer("user_id");
    table
      .foreign("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("cascade");
    table.boolean("is_verified");
    table.boolean("is_approved");
    table.binary("verification_document");
    table.text("verification_document_name");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salaries");
}
