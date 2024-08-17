import type { Knex } from "knex";

exports.up = function (knex: Knex) {
  return knex.schema.createTable("sessions", (table) => {
    table.string("sid", 255).primary().notNullable();
    table.json("sess").notNullable();
    table.timestamp("expired", { useTz: true }).notNullable();

    // Add index on expired column
    table.index(["expired"], "sessions_expired_index");
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTable("sessions");
};
