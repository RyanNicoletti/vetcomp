import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("jobs", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.text("job_title").notNullable();
    table.text("company").notNullable();
    table.text("job_location").notNullable();
    table.text("job_type");
    table.specificType("tags", "text[]").defaultTo("{}");
    table.text("description", "longtext");
    table.decimal("base_salary_min", 12, 2);
    table.decimal("base_salary_max", 12, 2);
    table.decimal("sign_on_bonus", 12, 2);
    table.text("percent_production");
    table.decimal("retention_bonus", 12, 2);
    table.text("additional_compensation_notes");
    table
      .enu("salary_frequency", ["annually", "hourly", "monthly"])
      .defaultTo("annually");
    table.text("additional_compensation");
    table
      .enu("applicant_collection_method", ["email", "external_website"])
      .notNullable();
    table.text("application_email");
    table.text("external_website");
    table.boolean("is_approved").defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {}
