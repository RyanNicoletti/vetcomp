import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("job_applications", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
    table
      .uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.text("full_name").notNullable();
    table.text("email").notNullable();
    table.text("phone_number").notNullable();
    table.text("resume_url");
    table.text("resume_name");
    table
      .enum("status", ["pending", "viewed", "contacted"])
      .defaultTo("pending");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("job_applications");
}
