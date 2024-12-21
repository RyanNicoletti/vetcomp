import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("jobs", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.text("title").notNullable();
    table.text("company").notNullable();
    table.text("location").notNullable();
    table
      .enum("type", ["full-time", "part-time", "contract", "relief"])
      .notNullable();
    table.text("practice_type").notNullable();
    table.decimal("salary_min", 12, 2).notNullable();
    table.decimal("salary_max", 12, 2).notNullable();
    table.decimal("sign_on_bonus", 12, 2);
    table.text("description").notNullable();
    table.text("requirements");
    table.text("benefits");
    table.text("application_url");
    table.text("contact_email").notNullable();
    table.timestamp("posted_date").defaultTo(knex.fn.now());
    table.timestamp("expires_at").notNullable();
    table.enum("status", ["active", "expired", "draft"]).defaultTo("active");
    table.boolean("is_approved").defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("jobs");
}
