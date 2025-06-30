import { Knex } from "knex";
import { salaries } from "../fixtures/salaries";
import { users } from "../fixtures/users";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  await knex.raw("TRUNCATE TABLE salaries RESTART IDENTITY CASCADE");

  // Inserts seed entries
  await knex("users").insert(users);
  await knex("salaries").insert(salaries);
}
