import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.text("email").notNullable().unique();
    table.text("password_hash");
    table.boolean("is_admin").defaultTo(false);
    table.boolean("is_verified").defaultTo(false);
    table.text("reset_token").nullable();
    table.timestamp("reset_token_expiry").nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
}
