import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("email_verifications", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("email").notNullable();
    table.string("verification_code").notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);
  });

  // Create an index on the expires_at column for efficient querying
  await knex.schema.raw(`
    CREATE INDEX idx_email_verifications_expires_at ON email_verifications (expires_at)
  `);

  // Create a function to automatically delete expired verifications
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION delete_expired_verifications()
    RETURNS trigger AS $$
    BEGIN
      DELETE FROM email_verifications WHERE expires_at < NOW();
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create a trigger to run the function periodically
  await knex.schema.raw(`
    CREATE TRIGGER trigger_delete_expired_verifications
    AFTER INSERT OR UPDATE ON email_verifications
    EXECUTE FUNCTION delete_expired_verifications();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(
    "DROP TRIGGER IF EXISTS trigger_delete_expired_verifications ON email_verifications"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS delete_expired_verifications()"
  );
  await knex.schema.dropTable("email_verifications");
}
