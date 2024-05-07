import { Knex } from "knex";
import { salaries } from "../fixtures/salaries";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.raw("TRUNCATE TABLE salaries RESTART IDENTITY CASCADE");

  // Inserts seed entries
  await knex("salaries").insert(salaries);
}
