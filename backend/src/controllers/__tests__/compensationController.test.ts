import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../services/compensationService", () => ({
  default: {
    getByIdAndUserId: vi.fn(),
    updateById: vi.fn(),
  },
}));

vi.mock("../../db/connection", () => ({
  db: {},
}));

vi.mock("../../services/userService", () => ({
  default: {
    getById: vi.fn(),
    findByEmail: vi.fn(),
    createWithNullPassword: vi.fn(),
    getCompsByUserId: vi.fn(),
  },
}));

vi.mock("../../services/b2Service", () => ({
  default: {
    uploadFileToB2: vi.fn(),
    getSignedUrl: vi.fn(),
  },
}));

import compensationController from "../compensationController";
import compensationService from "../../services/compensationService";
import { BadRequestError } from "../../errors/httpErrors";

const VALID_COMP_ID = "11111111-1111-4111-8111-111111111111";
const VALID_USER_ID = "22222222-2222-4222-8222-222222222222";

function buildReqRes() {
  const req = {
    params: { compId: VALID_COMP_ID },
    session: { userId: VALID_USER_ID },
    body: {},
    query: {},
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

describe("updateCompensation controller - 2-year cutoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects with BadRequestError when the comp is older than 2 years", async () => {
    const threeYearsAgo = new Date(
      Date.now() - 3 * 365 * 24 * 60 * 60 * 1000
    );
    vi.mocked(compensationService.getByIdAndUserId).mockResolvedValue({
      id: VALID_COMP_ID,
      user_id: VALID_USER_ID,
      created_at: threeYearsAgo,
    } as never);

    const { req, res, next } = buildReqRes();

    await compensationController.updateCompensation(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = vi.mocked(next).mock.calls[0][0] as unknown as Error;
    expect(err).toBeInstanceOf(BadRequestError);
    expect(err.message).toBe(
      "This compensation entry is over 2 years old. Please create a new post instead of editing this one."
    );

    expect(compensationService.updateById).not.toHaveBeenCalled();
  });

  it("does NOT throw the 2-year error when comp was created yesterday", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    vi.mocked(compensationService.getByIdAndUserId).mockResolvedValue({
      id: VALID_COMP_ID,
      user_id: VALID_USER_ID,
      created_at: yesterday,
    } as never);

    const { req, res, next } = buildReqRes();

    await compensationController.updateCompensation(req, res, next);

    // The controller proceeds past the cutoff; it may fail later (multer/JSON.parse)
    // but the error must not be the 2-year cutoff message.
    const err = vi.mocked(next).mock.calls[0]?.[0] as unknown as
      | Error
      | undefined;
    if (err) {
      expect(err.message).not.toContain("over 2 years old");
    }
  });
});
