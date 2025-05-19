import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Drop the existing enum constraint
  await knex.raw(
    `ALTER TABLE job_applications DROP CONSTRAINT job_applications_status_check`
  );

  // Add the new enum constraint with updated values
  await knex.raw(
    `ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check CHECK (status IN ('applied', 'viewed', 'contacted'))`
  );

  // Update default value for new records
  await knex.raw(
    `ALTER TABLE job_applications ALTER COLUMN status SET DEFAULT 'applied'`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE job_applications DROP CONSTRAINT job_applications_status_check`
  );
  await knex.raw(
    `ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check CHECK (status IN ('pending', 'viewed', 'contacted'))`
  );
  await knex.raw(
    `ALTER TABLE job_applications ALTER COLUMN status SET DEFAULT 'pending'`
  );
}
