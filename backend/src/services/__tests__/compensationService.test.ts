import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Knex } from "knex";
import compensationService from "../compensationService";

/**
 * Builds a mock knex query builder for the `.where().first()` chain
 * used by `getByIdAndUserId`. The final awaited value resolves to `result`.
 */
function createSelectMock(result: unknown) {
  const builder = {
    where: vi.fn(),
    first: vi.fn(),
  };
  builder.where.mockReturnValue(builder);
  builder.first.mockResolvedValue(result);

  const knexFn = vi.fn().mockReturnValue(builder);
  return { knexFn, builder };
}

/**
 * Builds a mock knex query builder for the `.where().update().returning()`
 * chain used by `updateById`. The final awaited value resolves to `result`.
 */
function createUpdateMock(result: unknown) {
  const builder = {
    where: vi.fn(),
    update: vi.fn(),
    returning: vi.fn(),
  };
  builder.where.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.returning.mockResolvedValue(result);

  const knexFn = vi.fn().mockReturnValue(builder);
  return { knexFn, builder };
}

describe("compensationService.getByIdAndUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the row when one is found", async () => {
    const fakeRow = { id: "comp-1", user_id: "user-1", company: "Acme Vet" };
    const { knexFn, builder } = createSelectMock(fakeRow);

    const result = await compensationService.getByIdAndUserId(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1"
    );

    expect(knexFn).toHaveBeenCalledWith("salaries");
    expect(builder.where).toHaveBeenCalledWith({
      id: "comp-1",
      user_id: "user-1",
    });
    expect(builder.first).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeRow);
  });

  it("returns null when no row is found", async () => {
    const { knexFn } = createSelectMock(undefined);

    const result = await compensationService.getByIdAndUserId(
      knexFn as unknown as Knex,
      "missing-comp",
      "user-1"
    );

    expect(result).toBeNull();
  });
});

describe("compensationService.updateById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forces is_approved to false in the update payload", async () => {
    const { knexFn, builder } = createUpdateMock([
      { id: "comp-1", is_approved: false },
    ]);

    await compensationService.updateById(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1",
      { is_approved: true, company: "Even Acme-r Vet" }
    );

    const payload = builder.update.mock.calls[0][0];
    expect(payload.is_approved).toBe(false);
  });

  it("calculates total_compensation = base_salary when production is missing", async () => {
    const { knexFn, builder } = createUpdateMock([{ id: "comp-1" }]);

    await compensationService.updateById(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1",
      { base_salary: 120000 }
    );

    const payload = builder.update.mock.calls[0][0];
    expect(payload.total_compensation).toBe(120000);
  });

  it("calculates total_compensation = base_salary + average_annual_production when both are set", async () => {
    const { knexFn, builder } = createUpdateMock([{ id: "comp-1" }]);

    await compensationService.updateById(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1",
      { base_salary: 120000, average_annual_production: 50000 }
    );

    const payload = builder.update.mock.calls[0][0];
    expect(payload.total_compensation).toBe(170000);
  });

  it("sets total_compensation to null when base_salary is missing", async () => {
    const { knexFn, builder } = createUpdateMock([{ id: "comp-1" }]);

    await compensationService.updateById(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1",
      { average_annual_production: 50000 }
    );

    const payload = builder.update.mock.calls[0][0];
    expect(payload.total_compensation).toBeNull();
  });

  it("scopes the update by both id and user_id (ownership check)", async () => {
    const { knexFn, builder } = createUpdateMock([{ id: "comp-1" }]);

    await compensationService.updateById(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1",
      { base_salary: 100000 }
    );

    expect(builder.where).toHaveBeenCalledWith({
      id: "comp-1",
      user_id: "user-1",
    });
  });

  it("returns null when no row was updated", async () => {
    const { knexFn } = createUpdateMock([]);

    const result = await compensationService.updateById(
      knexFn as unknown as Knex,
      "comp-1",
      "user-1",
      { base_salary: 100000 }
    );

    expect(result).toBeNull();
  });
});
