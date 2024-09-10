import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salaries", (table) => {
    table.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
    table
      .uuid("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.text("company");
    table.text("location");
    table.text("title");
    table.boolean("is_specialist").notNullable();
    table.text("specialization");
    table.text("type_of_practice");
    table.boolean("is_new_grad");
    table.integer("years_of_experience");
    table.decimal("base_salary", 12, 2);
    table.decimal("hourly_rate", 12, 2);
    table.enu("payment_frequency", ["annually", "hourly"]);
    table.decimal("average_annual_bonus", 12, 2);
    table.decimal("sign_on_bonus", 12, 2);
    table.decimal("average_annual_production", 12, 2);
    table.integer("percent_production");
    table.decimal("total_compensation", 12, 2);
    table.enu("gender", ["male", "female", "non-binary"]);
    table.integer("number_of_veterinarians");
    table.integer("days_worked_per_week");
    table.text("email").nullable();
    table.boolean("is_verified").defaultTo(false);
    table.boolean("is_approved").defaultTo(false);
    table.boolean("needs_review").defaultTo(false);
    table.text("verification_document_url");
    table.text("verification_document_name");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salaries");
}
