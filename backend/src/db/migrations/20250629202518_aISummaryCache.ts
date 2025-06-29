import type { Knex } from "knex";

exports.up = function (knex: Knex) {
  return knex.schema.createTable("salary_comparison_cache", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable();
    table.uuid("compensation_id").notNullable();
    table.text("ai_summary").notNullable();
    table.jsonb("comparison_data_hash").notNullable();
    table.timestamps(true, true);

    table.index(["user_id", "compensation_id"]);
    table.index("compensation_id");

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("compensation_id")
      .references("id")
      .inTable("salaries")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists("salary_comparison_cache");
};
